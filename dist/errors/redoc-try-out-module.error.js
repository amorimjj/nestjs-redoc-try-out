"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedocTryOutModuleError = void 0;
class RedocTryOutModuleError extends Error {
    constructor(error) {
        super(error.toString());
        Object.setPrototypeOf(this, RedocTryOutModuleError.prototype);
    }
}
exports.RedocTryOutModuleError = RedocTryOutModuleError;
