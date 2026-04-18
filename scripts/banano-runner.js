const bananojs = require('@bananocoin/bananojs');

const BANANODE_API_URL = 'https://kaliumapi.appditto.com/api';
bananojs.setBananodeApiUrl(BANANODE_API_URL);

async function run() {
    const method = process.argv[2];
    const args = JSON.parse(process.argv[3] || "[]");

    try {
        let result;
        if (method === 'getAccountInfo') {
            result = await bananojs.getAccountInfo(args[0]);
        } else if (method === 'getBananoAccount') {
            const privateKey = bananojs.getPrivateKey(args[0], args[1]);
            const publicKey = await bananojs.getPublicKey(privateKey);
            result = bananojs.getBananoAccount(publicKey);
        } else if (method === 'receiveBananos') {
            result = await bananojs.receiveBananoDepositsForSeed(args[0], args[1], args[2] || 'ban_1ka1ium4pfue3uxtntqsboa8egcw864xqdbc85vc5z33x5ne52pfcqigp5cb');
        } else if (method === 'sendBanano') {
            result = await bananojs.sendBananoWithdrawalFromSeed(args[0], args[1], args[2], args[3]);
        } else if (method === 'getRawFromDecimal') {
            result = bananojs.getBananoDecimalAmountAsRaw(args[0].toString());
        } else if (method === 'getDecimalFromRaw') {
            result = bananojs.getBananoPartsFromRaw(args[0]).banano;
        } else {
            throw new Error(`Unknown method: ${method}`);
        }

        console.log(JSON.stringify({ success: true, result }));
    } catch (e) {
        console.log(JSON.stringify({ success: false, error: e.message || String(e) }));
    }
}

run();
