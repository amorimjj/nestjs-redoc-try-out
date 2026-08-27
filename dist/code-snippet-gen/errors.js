"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidLanguageError = exports.InvalidMethodError = exports.InvalidSchemeError = exports.InvalidPathError = exports.NoServerError = exports.InvalidSchemeReferenceError = exports.InvalidAuthTypeError = void 0;
class InvalidAuthTypeError extends Error {
    constructor(type) {
        super(`The auth type ${type} is invalid or not implemented`);
        Object.setPrototypeOf(this, InvalidAuthTypeError.prototype);
    }
}
exports.InvalidAuthTypeError = InvalidAuthTypeError;
class InvalidSchemeReferenceError extends Error {
    constructor(schemeReference) {
        super(`The scheme reference ${schemeReference} is not valid or not implemented`);
        Object.setPrototypeOf(this, InvalidSchemeReferenceError.prototype);
    }
}
exports.InvalidSchemeReferenceError = InvalidSchemeReferenceError;
class NoServerError extends Error {
    constructor() {
        super(`In order to use code generation feature, servers must be provided on openapi spec`);
        Object.setPrototypeOf(this, NoServerError.prototype);
    }
}
exports.NoServerError = NoServerError;
class InvalidPathError extends Error {
    constructor(path) {
        super(`The path ${path} is not available`);
        Object.setPrototypeOf(this, InvalidPathError.prototype);
    }
}
exports.InvalidPathError = InvalidPathError;
class InvalidSchemeError extends Error {
    constructor(schemePath, schemeId) {
        super(`The scheme ${schemeId} is not available for ${schemePath}`);
        Object.setPrototypeOf(this, InvalidSchemeError.prototype);
    }
}
exports.InvalidSchemeError = InvalidSchemeError;
class InvalidMethodError extends Error {
    constructor(path, method) {
        super(`The method ${method} is not available for ${path}`);
        Object.setPrototypeOf(this, InvalidMethodError.prototype);
    }
}
exports.InvalidMethodError = InvalidMethodError;
class InvalidLanguageError extends Error {
    constructor(language) {
        super(`The language ${language} is not available`);
        Object.setPrototypeOf(this, InvalidLanguageError.prototype);
    }
}
exports.InvalidLanguageError = InvalidLanguageError;
