/**
 * Banano Service Library for PocketBase JS VM
 *
 * Utilizes a separate node process because bananojs requires async fetching 
 * which does not block symmetrically within Goja (PocketBase's engine).
 * Furthermore, Goja lacks Node APIs like Buffer that bananojs requires.
 */

function runSync(method, args) {
    try {
        const scriptPath = $filepath.join(__hooks, '..', 'scripts', 'banano-runner.js');
        // $os.cmd allows us to run standard Node synchronously, effectively bypassing Goja's wait limits!
        let resJson;
        try {
            resJson = $os.cmd("node", scriptPath, method, JSON.stringify(args || [])).output();
        } catch(osErr) {
            throw new Error("OS Command failed: " + osErr.message || String(osErr));
        }

        const type = typeof resJson;
        let strVal;
        try { strVal = String(resJson); } catch (e) { strVal = "cannot convert to string"; }
        
        throw new Error("DEBUG: type=" + type + ", val=" + strVal + ", method=" + method + ", args=" + JSON.stringify(args));

    } catch (e) {
        throw new Error("BananoJS sync error: " + e.message);
    }
}

module.exports = {
    getAccountInfo: (account) => {
        return runSync("getAccountInfo", [account]);
    },

    getBananoAccount: (seed, seedIndex = 0) => {
        return runSync("getBananoAccount", [seed, seedIndex]);
    },

    receiveBananos: (seed, seedIndex = 0, representative = 'ban_1ka1ium4pfue3uxtntqsboa8egcw864xqdbc85vc5z33x5ne52pfcqigp5cb') => {
        return runSync("receiveBananos", [seed, seedIndex, representative]);
    },

    sendBanano: (seed, seedIndex = 0, destAccount, amountRaw) => {
        return runSync("sendBanano", [seed, seedIndex, destAccount, amountRaw]);
    },

    getRawFromDecimal: (decimalAmount) => {
        return runSync("getRawFromDecimal", [decimalAmount]);
    },

    getDecimalFromRaw: (rawAmount) => {
        return runSync("getDecimalFromRaw", [rawAmount]);
    }
};
