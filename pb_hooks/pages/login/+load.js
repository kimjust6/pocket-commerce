/**
 * Loader for the login page.
 * Redirects to account dashboard if already authenticated.
 * @type {import('pocketpages').PageDataLoaderFunc}
 * @returns {Object} Empty object
 */
module.exports = function (context) {
    // If already logged in, redirect to account
    if (context.request.auth) {
        context.response.redirect('/account')
        return
    }

    return {}
}
