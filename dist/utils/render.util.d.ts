import { RedocModuleOptions } from '../interfaces/redoc-module-options.interface';
import { RedocDocument } from '../interfaces/redoc-document.interface';
export declare function renderRedocView(data: {
    path: string;
    docUrl: string;
    tryItOutJsMinFileName: string;
    options: RedocModuleOptions;
    document: RedocDocument;
}): Promise<void>;
