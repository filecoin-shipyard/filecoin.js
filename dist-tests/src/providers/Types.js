"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadChange = exports.Message = exports.Version = exports.TipSet = exports.BlockHeader = exports.Cid = exports.SigType = void 0;
var SigType;
(function (SigType) {
    SigType[SigType["SigTypeSecp256k1"] = 1] = "SigTypeSecp256k1";
    SigType[SigType["SigTypeBLS"] = 2] = "SigTypeBLS";
})(SigType = exports.SigType || (exports.SigType = {}));
var Cid = (function () {
    function Cid() {
    }
    return Cid;
}());
exports.Cid = Cid;
var BlockHeader = (function () {
    function BlockHeader() {
    }
    return BlockHeader;
}());
exports.BlockHeader = BlockHeader;
;
var TipSet = (function () {
    function TipSet() {
    }
    return TipSet;
}());
exports.TipSet = TipSet;
;
var Version = (function () {
    function Version() {
    }
    return Version;
}());
exports.Version = Version;
;
var Message = (function () {
    function Message() {
    }
    return Message;
}());
exports.Message = Message;
;
var HeadChange = (function () {
    function HeadChange() {
    }
    return HeadChange;
}());
exports.HeadChange = HeadChange;
;
;
//# sourceMappingURL=Types.js.map