"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedocDocumentModel = void 0;
const object_clone_util_1 = require("../utils/object-clone.util");
const normalize_snippet_code_1 = require("../utils/normalize-snippet-code");
const code_gen_1 = require("../code-snippet-gen/code-gen");
const snippet_generate_error_1 = require("../errors/snippet-generate.error");
class RedocDocumentModel {
    static addLogo(document, options) {
        if (!(options === null || options === void 0 ? void 0 : options.logo)) {
            return;
        }
        document.info['x-logo'] = Object.assign({}, options.logo);
    }
    static createTagsGroup(document) {
        var _a;
        return (_a = document.tags) === null || _a === void 0 ? void 0 : _a.map(tag => ({ name: tag.description || tag.name, tags: [tag.name] }));
    }
    static addTagsGroup(document, options) {
        var _a;
        if ((options === null || options === void 0 ? void 0 : options.tagGroups) || document.tags) {
            document['x-tagGroups'] = ((_a = options === null || options === void 0 ? void 0 : options.tagGroups) === null || _a === void 0 ? void 0 : _a.length) ? options.tagGroups : RedocDocumentModel.createTagsGroup(document);
        }
    }
    static generateCodeSample(document, path, method, languages) {
        const endpoint = (0, code_gen_1.getEndpointSnippets)(document, path, method, languages);
        return endpoint.snippets.map(snippet => ({ lang: snippet.title, source: (0, normalize_snippet_code_1.normalizeSnippetCode)(snippet.content) }));
    }
    static addCodeSamples(document, options) {
        if (options === null || options === void 0 ? void 0 : options.skipSnippetsGeneration) {
            return;
        }
        const codeSnippetsLanguages = (options === null || options === void 0 ? void 0 : options.codeSnippetsLanguages) || ['javascript'];
        for (const path in document.paths) {
            const operations = document.paths[path];
            for (const method in operations) {
                const operation = operations[method];
                try {
                    operation['x-codeSamples'] = operation['x-codeSamples'] || RedocDocumentModel.generateCodeSample(document, path, method, codeSnippetsLanguages);
                }
                catch (e) {
                    throw new snippet_generate_error_1.SnippetGenerateError(operation, path, method, e);
                }
            }
        }
    }
    static fromOpenApi(document, options) {
        const redocDocument = (0, object_clone_util_1.clone)(document);
        RedocDocumentModel.addLogo(redocDocument, options);
        RedocDocumentModel.addTagsGroup(redocDocument, options);
        RedocDocumentModel.addCodeSamples(redocDocument, options);
        return redocDocument;
    }
}
exports.RedocDocumentModel = RedocDocumentModel;
