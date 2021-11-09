export class InvalidAuthTypeError extends Error {
    constructor(type: string) {
        super(`The auth type ${type} is invalid or not implemented`);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidAuthTypeError.prototype);
    } 
}

export class InvalidSchemeReferenceError extends Error {
    constructor(schemeReference: string) {
        super(`The scheme reference ${schemeReference} is not valid or not implemented`);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidSchemeReferenceError.prototype);
    } 
}

export class NoServerError extends Error {
    constructor() {
        super(`In order to use code generation feature, servers must be provided on openapi spec`);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, NoServerError.prototype);
    } 
}

export class InvalidPathError extends Error {
    constructor(path: string) {
        super(`The path ${path} is not available`);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidPathError.prototype);
    } 
}

export class InvalidSchemeError extends Error {
    constructor(schemePath: string, schemeId: string) {
        super(`The scheme ${schemeId} is not available for ${schemePath}`);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidSchemeError.prototype);
    } 
}

export class InvalidMethodError extends Error {
    constructor(path: string, method: string) {
        super(`The method ${method} is not available for ${path}`);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidMethodError.prototype);
    } 
}

export class InvalidLanguageError extends Error {
    constructor(language: string) {
        super(`The language ${language} is not available`);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidLanguageError.prototype);
    } 
}