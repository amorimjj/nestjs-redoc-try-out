import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export class SnippetGenerateError extends Error {

    private readonly operation: OperationObject;
    private readonly path: string;
    private readonly method: string;
    protected readonly mainException: Error;

    constructor(operation: OperationObject, path: string, method: string, error: Error) {
        super(`Error generating snippet code for ${method} on ${path}`);

        this.operation = operation;
        this.path = path;
        this.method = method;
        this.mainException = error;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, SnippetGenerateError.prototype);
    }

    toString(): string {
        return `
            Error generating snippet code on ${this.path} for ${this.method}. \n
             - Parameters: ${this.operation.parameters} \n 
             - Request Body: ${this.operation.requestBody} \n
             Stack: ${this.mainException.stack}`
    }
}