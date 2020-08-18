"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var HttpJsonRpcConnector_1 = require("./connectors/HttpJsonRpcConnector");
var JsonRpcProvider_1 = require("./providers/JsonRpcProvider");
var MnemonicSigner_1 = require("./signers/MnemonicSigner");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var HttpJsonRpcWalletProvider_1 = require("./providers/wallet/HttpJsonRpcWalletProvider");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var lotusUrl, con, _a, _b, _c, _d, _e, _f, head, _g, _h, _j, _k, _l, signer, _m, _o, wallet, accounts, _p, _q, _r, signedBuffer, signedString, verifyBuffer, verifyString, e_1;
    return __generator(this, function (_s) {
        switch (_s.label) {
            case 0:
                _s.trys.push([0, 14, , 15]);
                lotusUrl = 'http://localhost:8000/rpc/v0';
                con = new JsonRpcProvider_1.JsonRpcProvider(new HttpJsonRpcConnector_1.HttpJsonRpcConnector(lotusUrl));
                console.error("======================= start ==========================");
                _b = (_a = console).error;
                return [4, con.version()];
            case 1:
                _b.apply(_a, [_s.sent()]);
                _d = (_c = console).error;
                return [4, con.readObj({ '/': 'bafy2bzacecqlzny34omms3qvyrqerdqy6jbxg77bje2h3upd4kxjnxkn2zf6y' })];
            case 2:
                _d.apply(_c, [_s.sent()]);
                _f = (_e = console).error;
                return [4, con.getBlockMessages({ '/': 'bafy2bzacecpkzzq7fbulsp2k6ej5bcxpjrtpbmneyha7yb746qwbp4qejsdf6' })];
            case 3:
                _f.apply(_e, [_s.sent()]);
                return [4, con.getHead()];
            case 4:
                head = _s.sent();
                console.error(head);
                console.error('111111111111', head.Blocks[0]);
                _h = (_g = console).error;
                _j = ['222222222222'];
                return [4, con.getBlock(head.Cids[0])];
            case 5:
                _h.apply(_g, _j.concat([_s.sent()]));
                _l = (_k = console).error;
                return [4, con.readObj(head.Blocks[0].Parents[0])];
            case 6:
                _l.apply(_k, [_s.sent()]);
                signer = new MnemonicSigner_1.MnemonicSigner('equip will roof matter pink blind book anxiety banner elbow sun young', 'password');
                _o = (_m = console).error;
                return [4, signer.sign({
                        From: 't1d2xrzcslx7xlbbylc5c3d5lvandqw4iwl6epxba',
                        To: 't17uoq6tp427uzv7fztkbsnn64iwotfrristwpryy',
                        Nonce: 1,
                        GasLimit: 1,
                        GasPrice: new bignumber_js_1.default(1),
                        Method: 0,
                        Params: "",
                        Value: new bignumber_js_1.default(1),
                        Version: 1,
                    })];
            case 7:
                _o.apply(_m, [_s.sent()]);
                console.error("======================= HttpJsonRpcWalletProvider ==========================");
                wallet = new HttpJsonRpcWalletProvider_1.HttpJsonRpcWalletProvider({ url: lotusUrl, token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.uA6qcpZGI4FJXQtSnwh5b12t_n0yTJt5hTahFej_G5Q' });
                return [4, wallet.getAccounts()];
            case 8:
                accounts = _s.sent();
                console.error("wallet.getAccounts()", accounts);
                _q = (_p = console).error;
                _r = ["wallet.setDefaultAccount"];
                return [4, wallet.setDefaultAccount(accounts[0])];
            case 9:
                _q.apply(_p, _r.concat([_s.sent()]));
                return [4, wallet.sign(new Uint8Array([1, 2, 3, 4]))];
            case 10:
                signedBuffer = _s.sent();
                console.error("wallet.sign signedBuffer", signedBuffer);
                return [4, wallet.sign("abc")];
            case 11:
                signedString = _s.sent();
                console.error("wallet.sign", signedString);
                return [4, wallet.verify(new Uint8Array([1, 2, 3, 4]), signedBuffer)];
            case 12:
                verifyBuffer = _s.sent();
                console.error("wallet.verify", verifyBuffer);
                return [4, wallet.verify("abca", signedString)];
            case 13:
                verifyString = _s.sent();
                console.error("wallet.verify", verifyString);
                return [3, 15];
            case 14:
                e_1 = _s.sent();
                console.error(e_1);
                return [3, 15];
            case 15: return [2];
        }
    });
}); })();
//# sourceMappingURL=tst.js.map