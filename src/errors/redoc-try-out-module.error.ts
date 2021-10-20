export class RedocTryOutModuleError extends Error {

    protected readonly mainException: Error;

    constructor(error: Error) {
        super(error.toString());
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, RedocTryOutModuleError.prototype);
    }
}