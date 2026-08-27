import { OpenAPIObject } from '@nestjs/swagger';
import { RedocDocument } from '../interfaces/redoc-document.interface';
import { RedocModuleOptions } from '../interfaces/redoc-module-options.interface';
export declare class RedocDocumentModel {
    private static addLogo;
    private static createTagsGroup;
    private static addTagsGroup;
    private static generateCodeSample;
    private static addCodeSamples;
    static fromOpenApi(document: OpenAPIObject, options?: RedocModuleOptions): RedocDocument;
}
