export declare class InvalidAuthTypeError extends Error {
    constructor(type: string);
}
export declare class InvalidSchemeReferenceError extends Error {
    constructor(schemeReference: string);
}
export declare class NoServerError extends Error {
    constructor();
}
export declare class InvalidPathError extends Error {
    constructor(path: string);
}
export declare class InvalidSchemeError extends Error {
    constructor(schemePath: string, schemeId: string);
}
export declare class InvalidMethodError extends Error {
    constructor(path: string, method: string);
}
export declare class InvalidLanguageError extends Error {
    constructor(language: string);
}
