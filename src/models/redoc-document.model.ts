import { OpenAPIObject } from '@nestjs/swagger';
import { RedocDocument, CodeSampleObject } from '../interfaces/redoc-document.interface';
import { RedocModuleOptions, TagGroupOptions } from '../interfaces/redoc-module-options.interface';
import { clone } from '../utils/object-clone.util';
import { normalizeSnippetCode } from '../utils/normalize-snippet-code';
import { getEndpointSnippets, Language } from '../code-snippet-gen/code-gen';
import { SnippetGenerateError }  from '../errors/snippet-generate.error';
import { HttpMethod } from '../code-snippet-gen/openapi-wrapper';

export class RedocDocumentModel {

    private static addLogo(document: RedocDocument, options?: RedocModuleOptions): void {
        if (!options?.logo) {
            return;
        }
        document.info['x-logo'] = { ...options.logo };
    }

    private static createTagsGroup(document: RedocDocument): TagGroupOptions[] {
        const tags = document.tags ?? [{ name: 'default', description: 'default' }];
        return tags.map(tag => ({ name: tag.description || tag.name, tags: [tag.name]}))
    }

    private static addTagsGroup(document: RedocDocument, options?: RedocModuleOptions):void  {
        if ( options?.tagGroups || document.tags ) {
            document['x-tagGroups'] = options?.tagGroups?.length ? options.tagGroups : RedocDocumentModel.createTagsGroup(document);
        }
    }

    private static generateCodeSample(document: RedocDocument, path: string, method: HttpMethod, languages: Language[]): CodeSampleObject[] {
        const endpoint = getEndpointSnippets(document as OpenAPIObject, path, method, languages);
        return endpoint.snippets.map(snippet => ({lang: snippet.title, source: normalizeSnippetCode(snippet.content) }));
    }

    private static addCodeSamples(document: RedocDocument, options?: RedocModuleOptions): void {

        if ( options?.skipSnippetsGeneration ) {
            return;
        }

        const codeSnippetsLanguages = options?.codeSnippetsLanguages || ['javascript'];

        for( const path in document.paths ) {
            const operations = document.paths[path];
            for ( const method in operations ) {
                const operation = (operations as any)[method];
                try {
                    operation['x-codeSamples'] = operation['x-codeSamples'] || RedocDocumentModel.generateCodeSample(document, path, method as HttpMethod, codeSnippetsLanguages);
                } catch (e) {
                    throw new SnippetGenerateError(operation, path, method, e);
                }
            }
        }
    }

    static fromOpenApi(document: OpenAPIObject, options?: RedocModuleOptions): RedocDocument {
        const redocDocument = clone(document) as RedocDocument;
        RedocDocumentModel.addLogo(redocDocument, options);
        RedocDocumentModel.addTagsGroup(redocDocument, options);
        RedocDocumentModel.addCodeSamples(redocDocument, options);
        return redocDocument;
    }
}