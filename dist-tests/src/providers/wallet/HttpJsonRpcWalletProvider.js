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
exports.HttpJsonRpcWalletProvider = void 0;
var HttpJsonRpcConnector_1 = require("../../connectors/HttpJsonRpcConnector");
var data_1 = require("../../utils/data");
var HttpJsonRpcWalletProvider = (function () {
    function HttpJsonRpcWalletProvider(url) {
        this.conn = new HttpJsonRpcConnector_1.HttpJsonRpcConnector(url);
    }
    HttpJsonRpcWalletProvider.prototype.newAccount = function (type) {
        if (type === void 0) { type = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.conn.request({ method: 'Filecoin.WalletNew', params: [type] })];
                    case 1:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    HttpJsonRpcWalletProvider.prototype.getNonce = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.conn.request({ method: 'Filecoin.MpoolGetNonce', params: [address] })];
                    case 1:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    HttpJsonRpcWalletProvider.prototype.getAccounts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.conn.request({ method: 'Filecoin.WalletList' })];
                    case 1:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    HttpJsonRpcWalletProvider.prototype.getBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.conn.request({ method: 'Filecoin.WalletBalance', params: [address] })];
                    case 1:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    HttpJsonRpcWalletProvider.prototype.setDefaultAccount = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.conn.request({ method: 'Filecoin.WalletSetDefault', params: [address] })];
                    case 1:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    HttpJsonRpcWalletProvider.prototype.getDefaultAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.conn.request({ method: 'Filecoin.WalletDefaultAddress' })];
                    case 1:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    HttpJsonRpcWalletProvider.prototype.sendMessage = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.conn.request({ method: 'Filecoin.MpoolPushMessage', params: [msg] })];
                    case 1:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    HttpJsonRpcWalletProvider.prototype.sendSignedMessage = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.conn.request({ method: 'Filecoin.MpoolPush', params: [msg] })];
                    case 1:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    HttpJsonRpcWalletProvider.prototype.signMessage = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var address, ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getDefaultAccount()];
                    case 1:
                        address = _a.sent();
                        return [4, this.conn.request({ method: 'Filecoin.WalletSignMessage', params: [address, msg] })];
                    case 2:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    HttpJsonRpcWalletProvider.prototype.sign = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var address, ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getDefaultAccount()];
                    case 1:
                        address = _a.sent();
                        data = data_1.toBase64(data);
                        return [4, this.conn.request({ method: 'Filecoin.WalletSign', params: [address, data] })];
                    case 2:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    HttpJsonRpcWalletProvider.prototype.verify = function (data, sign) {
        return __awaiter(this, void 0, void 0, function () {
            var address, ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getDefaultAccount()];
                    case 1:
                        address = _a.sent();
                        data = data_1.toBase64(data);
                        return [4, this.conn.request({ method: 'Filecoin.WalletVerify', params: [address, data, sign] })];
                    case 2:
                        ret = _a.sent();
                        return [2, ret.result];
                }
            });
        });
    };
    return HttpJsonRpcWalletProvider;
}());
exports.HttpJsonRpcWalletProvider = HttpJsonRpcWalletProvider;
//# sourceMappingURL=HttpJsonRpcWalletProvider.js.map