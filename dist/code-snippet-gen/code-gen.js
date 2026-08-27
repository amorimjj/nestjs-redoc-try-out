"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnippets = exports.getEndpointSnippets = void 0;
const httpsnippet_1 = __importDefault(require("httpsnippet"));
const errors_1 = require("./errors");
const openapi_to_har_1 = require("./openapi-to-har");
class Snippets {
    static getClient(target, clientKey) {
        const client = target.clients.find(client => client.key === clientKey);
        return client || Snippets.getClient(target, target.default);
    }
    static getTarget(language) {
        const [key, clientKey] = language.split('_');
        const target = httpsnippet_1.default.availableTargets().find(target => target.key === key);
        if (!target) {
            throw new errors_1.InvalidLanguageError(language);
        }
        const client = Snippets.getClient(target, clientKey);
        return { language: target.key, library: client.key, title: `${target.title} + ${client.title}` };
    }
    ;
    static createSnippet(target, snippet, mimeType) {
        return Object.assign(Object.assign({ id: target }, (mimeType && { mimeType })), { title: target.title, content: snippet.convert(target.language, target.library) });
    }
    static createSnippets(target, hars, snippets) {
        snippets.push(...hars.map(har => { var _a; return Snippets.createSnippet(target, new httpsnippet_1.default(har), (_a = har.postData) === null || _a === void 0 ? void 0 : _a.mimeType); }));
    }
    static create(languages, hars) {
        const snippets = [];
        const targets = languages.map(language => Snippets.getTarget(language));
        targets.forEach(target => Snippets.createSnippets(target, hars, snippets));
        return snippets;
    }
}
function getResourceName(url) {
    const pathComponents = url.split('/').reverse();
    return pathComponents.find(component => !!component && !/^{/.test(component));
}
;
function getMethodSnippets(methodHar, targets) {
    const snippets = Snippets.create(targets, methodHar.toArray());
    return {
        method: methodHar.httpMethod,
        url: methodHar.url,
        description: methodHar.description,
        resource: getResourceName(methodHar.url),
        snippets: snippets,
    };
}
function getEndpointSnippets(openApi, path, method, targets) {
    const methodHar = new openapi_to_har_1.ApiToHar(openApi).getPath(path).getMethod(method);
    return getMethodSnippets(methodHar, targets);
}
exports.getEndpointSnippets = getEndpointSnippets;
;
function getSnippets(openApi, targets) {
    const apiToHar = new openapi_to_har_1.ApiToHar(openApi);
    const results = [];
    apiToHar.paths.forEach(path => results.push(...path.methods.map(method => getMethodSnippets(method, targets))));
    return results;
}
exports.getSnippets = getSnippets;
;
