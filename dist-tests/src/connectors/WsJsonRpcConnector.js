"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.WsJsonRpcConnector = void 0;
var events_1 = require("events");
var WebSocket = __importStar(require("rpc-websockets"));
var WsJsonRpcConnector = (function (_super) {
    __extends(WsJsonRpcConnector, _super);
    function WsJsonRpcConnector(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        if (typeof options === 'string') {
            _this.url = options;
        }
        else {
            _this.url = options.url;
            _this.token = options.token;
        }
        _this.connected = false;
        return _this;
    }
    WsJsonRpcConnector.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve) {
                        _this.client = new WebSocket.Client(_this.fullUrl());
                        _this.client.on('open', function () {
                            _this.emit('connected');
                            resolve();
                        });
                        _this.client.on('error', function (error) { _this.emit('error', error); });
                        _this.client.on('close', function () {
                            _this.emit('disconnected');
                        });
                    })];
            });
        });
    };
    WsJsonRpcConnector.prototype.disconnect = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                (_a = this.client) === null || _a === void 0 ? void 0 : _a.close();
                return [2];
            });
        });
    };
    WsJsonRpcConnector.prototype.request = function (req) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, ((_a = this.client) === null || _a === void 0 ? void 0 : _a.call(req.method, req.params))];
                    case 1:
                        result = _b.sent();
                        return [2, {
                                result: result,
                            }];
                }
            });
        });
    };
    WsJsonRpcConnector.prototype.requestWithCallback = function (req, cbKey, cb) {
        var _a, _b;
        (_a = this.client) === null || _a === void 0 ? void 0 : _a.call(req.method, req.params);
        (_b = this.client) === null || _b === void 0 ? void 0 : _b.on(cbKey, cb);
    };
    WsJsonRpcConnector.prototype.on = function (event, listener) {
        return _super.prototype.on.call(this, event, listener);
    };
    WsJsonRpcConnector.prototype.fullUrl = function () {
        var url = this.url;
        if (this.token) {
            url = url + "?token=" + this.token;
        }
        return url;
    };
    return WsJsonRpcConnector;
}(events_1.EventEmitter));
exports.WsJsonRpcConnector = WsJsonRpcConnector;
//# sourceMappingURL=WsJsonRpcConnector.js.map