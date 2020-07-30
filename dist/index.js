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
Object.defineProperty(exports, "__esModule", { value: true });
var JsonRpcProvider_1 = require("./providers/JsonRpcProvider");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var con, _a, _b, _c, _d, _e, _f, head, _g, _h, _j, _k, _l, e_1;
    return __generator(this, function (_m) {
        switch (_m.label) {
            case 0:
                _m.trys.push([0, 7, , 8]);
                con = new JsonRpcProvider_1.JsonRpcProvider('http://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0');
                _b = (_a = console).error;
                return [4, con.version()];
            case 1:
                _b.apply(_a, [_m.sent()]);
                _d = (_c = console).error;
                return [4, con.readObj({ '/': 'bafy2bzacecqlzny34omms3qvyrqerdqy6jbxg77bje2h3upd4kxjnxkn2zf6y' })];
            case 2:
                _d.apply(_c, [_m.sent()]);
                _f = (_e = console).error;
                return [4, con.getBlockMessages({ '/': 'bafy2bzacecpkzzq7fbulsp2k6ej5bcxpjrtpbmneyha7yb746qwbp4qejsdf6' })];
            case 3:
                _f.apply(_e, [_m.sent()]);
                return [4, con.getHead()];
            case 4:
                head = _m.sent();
                console.error(head);
                console.error('111111111111', head.Blocks[0]);
                _h = (_g = console).error;
                _j = ['222222222222'];
                return [4, con.getBlock(head.Cids[0])];
            case 5:
                _h.apply(_g, _j.concat([_m.sent()]));
                _l = (_k = console).error;
                return [4, con.readObj(head.Blocks[0].Parents[0])];
            case 6:
                _l.apply(_k, [_m.sent()]);
                return [3, 8];
            case 7:
                e_1 = _m.sent();
                console.error(e_1);
                return [3, 8];
            case 8: return [2];
        }
    });
}); })();
var JsonRpcProvider_2 = require("./providers/JsonRpcProvider");
Object.defineProperty(exports, "JsonRpcProvider", { enumerable: true, get: function () { return JsonRpcProvider_2.JsonRpcProvider; } });
