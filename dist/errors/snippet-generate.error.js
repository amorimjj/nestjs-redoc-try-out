"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnippetGenerateError = void 0;
class SnippetGenerateError extends Error {
    constructor(operation, path, method, error) {
        super(`Error generating snippet code for ${method} on ${path}`);
        this.operation = operation;
        this.path = path;
        this.method = method;
        this.mainException = error;
        Object.setPrototypeOf(this, SnippetGenerateError.prototype);
    }
    toString() {
        return `
            Error generating snippet code on ${this.path} for ${this.method}. \n
             - Parameters: ${this.operation.parameters} \n 
             - Request Body: ${this.operation.requestBody} \n
             Stack: ${this.mainException.stack}`;
    }
}
exports.SnippetGenerateError = SnippetGenerateError;
