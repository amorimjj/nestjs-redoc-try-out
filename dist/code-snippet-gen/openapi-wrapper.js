"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _OpenApiWrapper_openApi, _OpenApiWrapper_paths;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApiWrapper = exports.VALID_METHODS = void 0;
const errors_1 = require("./errors");
exports.VALID_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];
class OpenApiWrapper {
    constructor(openApi) {
        _OpenApiWrapper_openApi.set(this, void 0);
        _OpenApiWrapper_paths.set(this, {});
        __classPrivateFieldSet(this, _OpenApiWrapper_openApi, openApi, "f");
    }
    get paths() {
        this.availablePaths
            .filter(pathname => !__classPrivateFieldGet(this, _OpenApiWrapper_paths, "f")[pathname])
            .forEach(pathname => this.getPath(pathname));
        return Object.values(__classPrivateFieldGet(this, _OpenApiWrapper_paths, "f"));
    }
    get availablePaths() {
        return Object.keys(__classPrivateFieldGet(this, _OpenApiWrapper_openApi, "f").paths);
    }
    get security() {
        return __classPrivateFieldGet(this, _OpenApiWrapper_openApi, "f").security || [];
    }
    get securityRequirements() {
        return this.securityToStrings(this.security);
    }
    get baseUrl() {
        var _a;
        const server = (_a = __classPrivateFieldGet(this, _OpenApiWrapper_openApi, "f").servers) === null || _a === void 0 ? void 0 : _a.find(server => !!server.url);
        if (!server) {
            throw new errors_1.NoServerError();
        }
        return server === null || server === void 0 ? void 0 : server.url;
    }
    resolveRef(ref) {
        return ref.split('/').reduce((previous, current) => previous === '#' ? __classPrivateFieldGet(this, _OpenApiWrapper_openApi, "f")[current] : previous[current]);
    }
    resolveScheme(resolve) {
        if (!resolve) {
            return resolve;
        }
        if (resolve['$ref']) {
            const refPath = resolve['$ref'];
            const schemaName = refPath.split('/').pop();
            const resolved = this.resolveScheme(this.resolveRef(refPath));
            if (resolved && !resolved.title && schemaName) {
                resolved.title = schemaName;
            }
            return resolved;
        }
        const schema = resolve;
        const resolveArray = (arr) => arr === null || arr === void 0 ? void 0 : arr.forEach((item, index) => {
            if (item)
                arr[index] = this.resolveScheme(item);
        });
        const resolveMap = (obj) => {
            if (obj) {
                for (const key of Object.keys(obj)) {
                    if (obj[key])
                        obj[key] = this.resolveScheme(obj[key]);
                }
            }
        };
        resolveArray(schema.oneOf);
        resolveArray(schema.anyOf);
        resolveArray(schema.allOf);
        if (schema.items) {
            schema.items = this.resolveScheme(schema.items);
        }
        resolveMap(schema.properties);
        if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
            schema.additionalProperties = this.resolveScheme(schema.additionalProperties);
        }
        return schema;
    }
    resolveRequestBodyReferences(requestBody) {
        const content = (requestBody === null || requestBody === void 0 ? void 0 : requestBody.content) || {};
        Object.values(content).filter(mediaType => !!mediaType['schema']).forEach(mediaType => mediaType['schema'] = this.resolveScheme(mediaType['schema']));
        return requestBody;
    }
    resolveBaseUrl(servers, baseUrl) {
        const server = servers === null || servers === void 0 ? void 0 : servers.find(server => !!server.url);
        return (server === null || server === void 0 ? void 0 : server.url) || baseUrl;
    }
    createOperation(operation, methodName, pathname, parentBaseUrl) {
        if (!operation) {
            throw new errors_1.InvalidMethodError(pathname, methodName);
        }
        const control = {};
        const getBaseUrl = (servers) => control.baseUrl = control.baseUrl || this.resolveBaseUrl(servers, parentBaseUrl);
        const getRequestBody = (requestBody) => control.requestBody = control.requestBody || this.resolveRequestBodyReferences(requestBody);
        const getSecurityRequirements = (security) => control.securityRequirements = control.securityRequirements || this.securityToRequirements(security);
        const getSecurityScheme = (id) => this.getSecurityScheme(id);
        return {
            pathname,
            method: methodName.toUpperCase(),
            tags: operation.tags || [],
            summary: operation.summary || '',
            description: operation.description || '',
            operationId: operation.operationId || '',
            parameters: operation.parameters || [],
            responses: operation.responses || {},
            deprecated: !!operation.deprecated,
            security: operation.security || [],
            servers: operation.servers || [],
            get baseUrl() { return getBaseUrl(operation.servers); },
            get securityRequirements() { return getSecurityRequirements(operation.security); },
            get requestBody() { return getRequestBody(operation.requestBody); },
            get securityInfo() {
                return {
                    get requirements() { return getSecurityRequirements(operation.security); },
                    getSecurityScheme(id) { return getSecurityScheme(id); }
                };
            }
        };
    }
    createPath(path, pathname) {
        const control = {};
        const getBaseUrl = (servers) => control.baseUrl = control.baseUrl || this.resolveBaseUrl(servers, this.baseUrl);
        const getOperation = (operation) => control[operation] = control[operation] || this.createOperation(path[operation], operation, pathname, pathWrapper.baseUrl);
        const getMethods = () => Object.keys(path).filter((key) => exports.VALID_METHODS.includes(key)).map(method => pathWrapper[method]);
        const pathWrapper = {
            pathname,
            summary: path.summary || '',
            description: path.description || '',
            servers: path.servers || [],
            parameters: path.parameters || [],
            get baseUrl() { return getBaseUrl(path.servers); },
            get methods() { return getMethods(); },
            get get() { return getOperation('get'); },
            get put() { return getOperation('put'); },
            get post() { return getOperation('post'); },
            get delete() { return getOperation('delete'); },
            get options() { return getOperation('options'); },
            get head() { return getOperation('head'); },
            get patch() { return getOperation('patch'); },
            get trace() { return getOperation('trace'); },
        };
        return pathWrapper;
    }
    securityToRequirements(security) {
        return (security || []).length > 0 ? this.securityToStrings(security) : this.securityRequirements;
    }
    securityToStrings(security) {
        return security.map((securityObject) => Object.keys(securityObject).find(key => !!key) || 'public');
    }
    getSecurityScheme(id) {
        var _a;
        if (!((_a = __classPrivateFieldGet(this, _OpenApiWrapper_openApi, "f").components) === null || _a === void 0 ? void 0 : _a.securitySchemes[id])) {
            throw new errors_1.InvalidSchemeError('securityScheme', id);
        }
        return this.resolveScheme(__classPrivateFieldGet(this, _OpenApiWrapper_openApi, "f").components.securitySchemes[id]);
    }
    getPath(pathname) {
        if (!this.availablePaths.includes(pathname)) {
            throw new errors_1.InvalidPathError(pathname);
        }
        __classPrivateFieldGet(this, _OpenApiWrapper_paths, "f")[pathname] = __classPrivateFieldGet(this, _OpenApiWrapper_paths, "f")[pathname] || this.createPath(__classPrivateFieldGet(this, _OpenApiWrapper_openApi, "f").paths[pathname], pathname);
        return __classPrivateFieldGet(this, _OpenApiWrapper_paths, "f")[pathname];
    }
}
exports.OpenApiWrapper = OpenApiWrapper;
_OpenApiWrapper_openApi = new WeakMap(), _OpenApiWrapper_paths = new WeakMap();
