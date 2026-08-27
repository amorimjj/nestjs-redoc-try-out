import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
export declare class SnippetGenerateError extends Error {
    private readonly operation;
    private readonly path;
    private readonly method;
    protected readonly mainException: Error;
    constructor(operation: OperationObject, path: string, method: string, error: Error);
    toString(): string;
}
