import { OpenAPIObject } from '@nestjs/swagger';
import * as codeGen from '../code-snippet-gen/code-gen'
import { RedocDocumentModel } from './redoc-document.model';
import { SnippetGenerateError } from '../errors/snippet-generate.error';

describe('RedocDocumentModel', () => {

    describe('X-Logo', () => {
        it( 'Should not add x-logo options is not defined', () => {
            const document = { info: {} } as OpenAPIObject
            const redocDoc = RedocDocumentModel.fromOpenApi(document);
            expect(redocDoc.info['x-logo']).toBeFalsy();
        });

        it( 'Should add x-logo if logo not defined', () => {
            const document = { info: {} } as OpenAPIObject
            const redocDoc = RedocDocumentModel.fromOpenApi(document, {});
            expect(redocDoc.info['x-logo']).toBeFalsy();
        });

        it( 'Should add x-logo if logo not defined', () => {
            const document = { info: {} } as OpenAPIObject
            const logo = { url: 'test/url'};
            const redocDoc = RedocDocumentModel.fromOpenApi(document, { logo });
            expect(redocDoc.info['x-logo']).toEqual(logo);
        });
    });

    describe('X-tagGroups', () => {
        it('Should not add x-tagGroups if tags is not defined', () => {
            const document = { } as OpenAPIObject
            const redocDoc = RedocDocumentModel.fromOpenApi(document);
            expect(redocDoc['x-tagGroups']).toBeUndefined();
        });

        it('Should use options tagGroups if provided', () => {
            const document = { tags: [{ name: 'user' }] } as any;
            const options = { tagGroups: [ { name: 'Auth', tags: ['user']}] }
            const redocDoc = RedocDocumentModel.fromOpenApi(document, options);
            expect(redocDoc['x-tagGroups']).toEqual(options.tagGroups);
        });

        describe('When tagGroups is not provided or empty', () => {

            const expected = [{'name': 'user', tags:['user']}, {'name': 'customer', tags:['client']}];
            const document = { tags: [{ name: 'user' }, { name:'client', 'description': 'customer'}] } as any;

            it('Should generate from tags for no options', () => {
                const redocDoc = RedocDocumentModel.fromOpenApi(document);
                expect(redocDoc['x-tagGroups']).toEqual(expected);
            });

            it('Should generate from tags for tagGroups', () => {
                const redocDoc = RedocDocumentModel.fromOpenApi(document, {});
                expect(redocDoc['x-tagGroups']).toEqual(expected);
            });

            it('Should generate from tags for empty tagGroups', () => {
                const redocDoc = RedocDocumentModel.fromOpenApi(document, { tagGroups: []});
                expect(redocDoc['x-tagGroups']).toEqual(expected);
            });
        });
    });

    describe('X-codeSamples', () => {

        let document, getEndpointSnippetsSpy;

        beforeEach(() => {
            getEndpointSnippetsSpy = jest.spyOn(codeGen, 'getEndpointSnippets');
            document = { paths: { '/endpoint/test1': { 'get': {} }, '/endpoint/test2': { 'post': {'x-codeSamples': [ { 'lang': 'js', 'source': 'same code'}]} } } } as any;
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        describe('When skipSnippetsGeneration is enabled', () => {
            it('Should skip code generation', () => {
                const redocDoc = RedocDocumentModel.fromOpenApi(document, { skipSnippetsGeneration: true });
                expect(getEndpointSnippetsSpy).not.toHaveBeenCalled();
                expect(redocDoc.paths['/endpoint/test1']['x-codeSamples']).toBeFalsy();
            });
        });


        describe('When skipSnippetsGeneration is disabled', () => {
            it('Should call code generation for not supplied x-codeSamples', () => {
                const snippets = [{ title: 'title', content: 'content'}];
                getEndpointSnippetsSpy.mockImplementation(() => ({ snippets }))
                const redocDoc = RedocDocumentModel.fromOpenApi(document, { codeSnippetsLanguages: ['javascript_xhr']});
                expect(getEndpointSnippetsSpy).toHaveBeenNthCalledWith(1, redocDoc, '/endpoint/test1', 'get', ['javascript_xhr']);
                expect(redocDoc.paths['/endpoint/test1']['get']['x-codeSamples']).toEqual([{ lang: 'title', source: 'content'}]);
                expect(redocDoc.paths['/endpoint/test2']['post']['x-codeSamples']).toEqual([ { 'lang': 'js', 'source': 'same code'}]);
            });

            it('Should throw SnippetGenerateError', () => {
                getEndpointSnippetsSpy
                    .mockImplementation(() => { throw new Error(); });
                expect(() => RedocDocumentModel.fromOpenApi(document))
                    .toThrow(SnippetGenerateError);

            });
        });
    });
});