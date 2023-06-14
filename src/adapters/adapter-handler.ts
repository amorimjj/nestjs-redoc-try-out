import pathModule from "path";
import { HttpServer } from '@nestjs/common';
import { Request, Response } from 'express';
import { tryItOutJsMinFileName } from 'redoc-try-it-out';
import { RedocDocument } from '../interfaces/redoc-document.interface';
import { RedocModuleOptions} from '../interfaces/redoc-module-options.interface';
import { renderRedocView } from '../utils/render.util';

export class NotImplementedError extends Error { }

export abstract class AdapterHandler
{
    protected abstract get adapterName(): string;
    protected abstract setup(): Promise<void> | void;

    private static httpAdapter: HttpServer;
    private static path: string;
    private static document: RedocDocument;
    private static options: RedocModuleOptions;

    protected nextHandler?: AdapterHandler;

    protected get httpAdapter(): HttpServer {
        return AdapterHandler.httpAdapter;
    }
    protected get path(): string {
        return AdapterHandler.path;
    }
    protected get document(): RedocDocument {
        return AdapterHandler.document;
    }
    protected get options(): RedocModuleOptions {
        return AdapterHandler.options;
    }

    protected get docUrl(): string {
       return [this.path,`${this.options?.docName||'swagger'}.json`].join('/');
    }

    private get isExpectedAdapter(): boolean {
        return this.httpAdapter?.constructor?.name === this.adapterName;
    }

    protected setNextHandler(handler: AdapterHandler): AdapterHandler {
        this.nextHandler = handler;
        return handler;
    }

    public async handle(): Promise<void> {
        if ( this.isExpectedAdapter) {
            await this.setup();
            return;
        }
        return this.nextHandler?.handle();
    }

    public static init(adapter: HttpServer, path: string, document: RedocDocument, options: RedocModuleOptions): AdapterHandler {
        AdapterHandler.httpAdapter = adapter;
        AdapterHandler.path = path;
        AdapterHandler.document = document;
        AdapterHandler.options = options;

        const expressHandler = new ExpressAdapterHandler();
        const fastifyHandler = new FastifyAdapterHandler();
        expressHandler.setNextHandler(fastifyHandler);

        return expressHandler;
    }
}

class ExpressAdapterHandler extends AdapterHandler {

    protected get adapterName() {
        return 'ExpressAdapter';
    }

    private async setupRedocHtml(): Promise<void> {
        const { path, docUrl, options, document } = this;
        const redocHTML = await renderRedocView({ path, tryItOutJsMinFileName, docUrl, options: options||{}, document });
        this.httpAdapter.get(this.path, async (req: Request, res: Response) => res.send(redocHTML));
    }

    private setupDocUrl(): void {
        this.httpAdapter.get(this.docUrl,  (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(this.document);
        });
    }

    private setupJS(): void {
        const pathToModule = require.resolve('redoc-try-it-out');
        this.httpAdapter.get(`${this.path}/${tryItOutJsMinFileName}` ,  (req: Request, res: Response ) => {
            res.setHeader('Content-Type', 'plain/text');
            res.sendFile(pathModule.join(pathModule.dirname(pathToModule), tryItOutJsMinFileName));
        });
    }

    protected async setup(): Promise<void> {
        await this.setupRedocHtml();
        this.setupDocUrl();
        this.setupJS();
    }
}

class FastifyAdapterHandler extends ExpressAdapterHandler {
  protected get adapterName() {
    return "FastifyAdapter";
  }
}