/**
 * PocketPages Configuration with Custom Auth Plugin
 */

/**
 * Safely parses a JSON string.
 * @param {string} value - The JSON string to parse.
 * @returns {any} The parsed value or the original value if parsing fails.
 */
const safeParseJson = (value) => {
    if (!value) return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

/**
 * Converts a GoJA object to a plain JS object.
 * @param {any} value - The value to convert.
 * @returns {any} The plain object.
 */
const toPlainObject = (value) => {
    if (typeof value === "object" && value !== null) {
        return JSON.parse(JSON.stringify(value));
    }
    return value;
};

// Custom Auth Plugin Factory (inline)
/**
 * Safely retrieves a cookie value from the request.
 * Supports request.cookie / request.cookies as either a function or an object/map.
 * @param {any} request - The request object.
 * @param {string} name - The name of the cookie.
 * @returns {any} The cookie value, or null if not found.
 */
const getCookie = (request, name) => {
    if (!request) return null;
    
    // Check request.cookie
    if (typeof request.cookie === "function") {
        try {
            return request.cookie(name);
        } catch { }
    }
    if (request.cookie && typeof request.cookie === "object") {
        if (request.cookie[name] !== undefined) {
            return request.cookie[name];
        }
    }
    
    // Check request.cookies
    if (typeof request.cookies === "function") {
        try {
            return request.cookies(name);
        } catch { }
    }
    if (request.cookies && typeof request.cookies === "object") {
        if (request.cookies[name] !== undefined) {
            return request.cookies[name];
        }
    }
    
    return null;
};

/**
 * Factory for the custom authentication plugin.
 * @param {import('pocketpages').PluginConfig} config - The plugin configuration.
 * @returns {import('pocketpages').Plugin} The auth plugin instance.
 */
const authPlugin = (config) => {
    const globalApi = config?.globalApi || config || {};
    const _dbg = globalApi.dbg || console.log;
    const info = globalApi.info || console.log;

    // Global API methods for user management
    globalApi.createUser = (email, password, options) => {
        if (!email.trim()) throw new Error("Email is required");
        if (!password.trim()) throw new Error("Password is required");
        const pb = globalApi.pb();
        const user = pb.collection(options?.collection ?? "users").create({
            email,
            password,
            passwordConfirm: password
        });
        _dbg(`created user: ${user.id}`);
        if (options?.sendVerificationEmail === undefined || options.sendVerificationEmail) {
            globalApi.requestVerification(email, options);
        }
        return user;
    };

    globalApi.createAnonymousUser = (options) => {
        const email = `anonymous-${$security.randomStringWithAlphabet(10, "123456789")}@example.com`;
        return {
            email,
            ...globalApi.createPasswordlessUser(email, {
                ...options,
                sendVerificationEmail: false
            })
        };
    };

    globalApi.createPasswordlessUser = (email, options) => {
        const password = $security.randomStringWithAlphabet(40, "123456789");
        _dbg(`created passwordless user: ${email}:${password}`);
        return {
            password,
            user: globalApi.createUser(email, password, options)
        };
    };

    globalApi.requestVerification = (email, options) => {
        const pb = globalApi.pb();
        pb.collection(options?.collection ?? "users").requestVerification(email);
    };

    globalApi.confirmVerification = (token, options) => {
        const pb = globalApi.pb();
        pb.collection(options?.collection ?? "users").confirmVerification(token);
    };

    globalApi.requestOTP = (email, options) => {
        const pb = globalApi.pb();
        try {
            globalApi.createPasswordlessUser(email, {
                sendVerificationEmail: false,
                ...options
            });
        } catch (e) { }
        const res = pb.collection(options?.collection ?? "users").requestOTP(email);
        return res;
    };

    return {
        name: "auth",

        onRequest: ({ request, response }) => {
            const { auth } = request;
            if (auth) {
                _dbg(`skipping cookie auth because auth record already set: ${auth.id}`);
                return;
            }

            // Check for auth cookie
            const cookieRecordAuth = safeParseJson(getCookie(request, "pb_auth"));
            if (!cookieRecordAuth || typeof cookieRecordAuth !== "object") {
                _dbg(`invalid auth cookie found: ${cookieRecordAuth}`);
                response.cookie("pb_auth", "");
                return;
            }

            if (cookieRecordAuth?.token) {
                try {
                    const validAuthRecord = $app.findAuthRecordByToken(cookieRecordAuth.token);
                    if (!validAuthRecord) {
                        _dbg(`invalid auth token found in cookie: ${cookieRecordAuth.token}`);
                        response.cookie("pb_auth", "");
                        return;
                    }
                    $apis.enrichRecord(request.event, validAuthRecord);
                    request.auth = validAuthRecord;
                    request.authToken = cookieRecordAuth.token;
                } catch (e) {
                    _dbg(`error fetching auth record: ${e}`);
                }
            }
        },

        onExtendContextApi: ({ api }) => {
            const pb = () => api.pb();

            api.registerWithPassword = (email, password, options) => {
                api.createUser(email, password, options);
                const authData = api.signInWithPassword(email, password, options);
                return authData;
            };

            api.signInWithPassword = (email, password, options) => {
                const authData = pb().collection(options?.collection ?? "users").authWithPassword(email, password);
                api.signIn(authData);
                return authData;
            };

            api.signInAnonymously = (options) => {
                const { user, email, password } = api.createAnonymousUser();
                const authData = api.signInWithPassword(email, password, options);
                return authData;
            };

            api.signInWithOTP = (otpId, password, options) => {
                const authData = pb().collection(options?.collection ?? "users").authWithOTP(otpId, password.toString());
                api.signIn(authData);
                return authData;
            };

            api.requestOAuth2Login = (providerName, options) => {
                const methods = pb().collection(options?.collection ?? "users").listAuthMethods();
                const { providers } = methods.oauth2;
                const provider = providers.find((p) => p.name === providerName);
                if (!provider) throw new Error(`Provider ${providerName} not found`);

                // Ensure appURL has protocol
                let appURL = $app.settings().meta.appURL;
                if (appURL && !appURL.startsWith('http://') && !appURL.startsWith('https://')) {
                    appURL = 'https://' + appURL;
                }
                const redirectUrl = `${appURL}${options?.redirectPath ?? "/auth/oauth/confirm"}`;
                const authUrl = provider.authURL + redirectUrl;

                // Store OAuth state in cookie
                api.response.cookie(options?.cookieName ?? "pp_oauth_state", {
                    name: provider.name,
                    state: provider.state,
                    codeChallenge: provider.codeChallenge,
                    codeVerifier: provider.codeVerifier,
                    redirectUrl
                });

                if (options?.autoRedirect ?? true) {
                    api.response.redirect(authUrl);
                }
                return authUrl;
            };

            api.signInWithOAuth2 = (state, code, options, _storedProviderInfo) => {
                const cookieVal = getCookie(api.request, options?.cookieName ?? "pp_oauth_state");
                const storedProvider = _storedProviderInfo ?? (typeof cookieVal === "string" ? safeParseJson(cookieVal) : cookieVal);
                if (!storedProvider) throw new Error("No stored provider info found");
                if (storedProvider.state !== state) throw new Error("State parameters don't match.");

                const authData = pb().collection(options?.collection ?? "users").authWithOAuth2Code(
                    storedProvider.name,
                    code,
                    storedProvider.codeVerifier,
                    storedProvider.redirectUrl,
                    { emailVisibility: false }
                );
                api.signIn(authData);
                return authData;
            };

            api.signOut = () => {
                api.response.cookie("pb_auth", "");
            };

            api.signIn = (authData) => {
                const { record, token } = authData;
                if (!record) throw new Error("No auth record found");
                _dbg(`signing in with token and saving to pb_auth cookie: ${record.id} ${token}`);
                api.response.cookie("pb_auth", {
                    token,
                    record: toPlainObject(record)
                });
            };
        }
    };
};

/**
 * PocketPages configuration function.
 * @param {import('pocketpages').ConfigContext} api - The configuration context.
 * @returns {import('pocketpages').Config} The configuration object.
 */
module.exports = function (api) {
    return {
        plugins: [
            'pocketpages-plugin-js-sdk',
            'pocketpages-plugin-ejs',
            authPlugin,
        ],
        debug: false,
    }
}
