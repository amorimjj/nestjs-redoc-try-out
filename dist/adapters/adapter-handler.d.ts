import { HttpServer } from "@nestjs/common";
import { RedocDocument } from "../interfaces/redoc-document.interface";
import { RedocModuleOptions } from "../interfaces/redoc-module-options.interface";
export declare class NotImplementedError extends Error {
}
export declare abstract class AdapterHandler {
    protected abstract get adapterName(): string;
    protected abstract setup(): void;
    private static httpAdapter;
    private static path;
    private static document;
    private static options;
    protected nextHandler?: AdapterHandler;
    protected get httpAdapter(): HttpServer;
    protected get path(): string;
    protected get document(): RedocDocument;
    protected get options(): RedocModuleOptions;
    protected get docUrl(): string;
    private get isExpectedAdapter();
    protected setNextHandler(handler: AdapterHandler): AdapterHandler;
    handle(): Promise<void>;
    static init(adapter: HttpServer, path: string, document: RedocDocument, options: RedocModuleOptions): AdapterHandler;
}
