"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBase64 = void 0;
var btoa_lite_1 = __importDefault(require("btoa-lite"));
exports.toBase64 = function (data) {
    if (typeof data !== 'string') {
        data = btoa_lite_1.default(new Uint8Array(data)
            .reduce(function (data, byte) { return data + String.fromCharCode(byte); }, ''));
    }
    else {
        data = btoa_lite_1.default(data);
    }
    return data;
};
//# sourceMappingURL=data.js.map