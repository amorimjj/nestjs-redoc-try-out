"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiToHar = void 0;
const OpenAPISampler = __importStar(require("openapi-sampler"));
const errors_1 = require("./errors");
const openapi_wrapper_1 = require("./openapi-wrapper");
const VALID_MIME_TYPES = ['application/json', 'application/xml', 'application/x-www-form-urlencoded', 'multipart/form-data'];
class ParameterItem {
    constructor(scheme) {
        this.scheme = scheme;
        this.setName();
        this.setValue();
    }
    get in() {
        var _a;
        return ((_a = this.scheme['in']) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    }
    get isHeader() {
        return this.in === 'header';
    }
    get isQuery() {
        return this.in === 'query';
    }
    get isCookie() {
        return this.in === 'cookie';
    }
    isEqualTo(paramenter) {
        return this.name === paramenter.name && this.in === paramenter.in;
    }
    toHarItem() {
        return { name: this.name, value: this.value };
    }
}
class AuthParameterToHar extends ParameterItem {
    get isInHeader() {
        return !this.isApikey || this.isHeader;
    }
    get authType() {
        var _a;
        const authType = this.scheme.type.toLowerCase();
        return authType === 'http' ? (_a = this.scheme.scheme) === null || _a === void 0 ? void 0 : _a.toLowerCase() : authType;
    }
    get isApikey() {
        return this.authType === 'apikey';
    }
    constructor(securityScheme) {
        super(securityScheme);
        const validAuthTypes = ['basic', 'apikey', 'oauth2', 'bearer'];
        if (!validAuthTypes.includes(this.authType)) {
            throw new errors_1.InvalidAuthTypeError(this.authType);
        }
    }
    getApiKeySchemeName() {
        return this.isApikey && this.scheme.name ? this.scheme.name : '';
    }
    getApiKeyHeaderValue() {
        return this.isApikey ? 'REPLACE_KEY_VALUE' : '';
    }
    getTokenHeaderValue() {
        return this.authType === 'basic' ? 'Basic REPLACE_BASIC_AUTH' : 'Bearer REPLACE_BEARER_TOKEN';
    }
    setName() {
        this.name = this.getApiKeySchemeName() || 'Authorization';
    }
    setValue() {
        this.value = this.getApiKeyHeaderValue() || this.getTokenHeaderValue();
    }
}
class ParameterToHar extends ParameterItem {
    get type() {
        return this.scheme.schema['type'];
    }
    get example() {
        return this.scheme.example || '';
    }
    get default() {
        return this.scheme.schema['default'] || this.example;
    }
    setName() {
        this.name = this.scheme.name;
    }
    setValue() {
        this.value = this.default || `SOME_${this.type.toUpperCase()}_VALUE`;
    }
}
class Parameters {
    constructor(parameters, parent) {
        this.parameters = ((parameters || []).map(param => new ParameterToHar(param)));
        this.parent = parent;
    }
    merge(parameters, parentParameters) {
        (parentParameters || []).forEach(parentParameter => {
            if (!parameters.find(parameter => parameter.isEqualTo(parentParameter))) {
                parameters.push(parentParameter);
            }
        });
        return parameters.map(param => param.toHarItem());
    }
    get headerParameters() {
        return this.parameters.filter(param => param.isHeader);
    }
    get queryParameters() {
        return this.parameters.filter(param => param.isQuery);
    }
    get cookieParameters() {
        return this.parameters.filter(param => param.isCookie);
    }
    getHeaderParameters() {
        var _a;
        return this.merge(this.headerParameters, (_a = this.parent) === null || _a === void 0 ? void 0 : _a.headerParameters);
    }
    getQueryParameters() {
        var _a;
        return this.merge(this.queryParameters, (_a = this.parent) === null || _a === void 0 ? void 0 : _a.queryParameters);
    }
    getCookieParameters() {
        var _a;
        return this.merge(this.cookieParameters, (_a = this.parent) === null || _a === void 0 ? void 0 : _a.cookieParameters);
    }
}
class MethodSecurityRequirements {
    constructor(securityInfo) {
        this.securityInfo = securityInfo;
    }
    getAuthParameter(id) {
        const scheme = this.securityInfo.getSecurityScheme(id);
        return new AuthParameterToHar(scheme);
    }
    get nonPublicRequirements() {
        return this.securityInfo.requirements.filter(requirement => requirement !== 'public');
    }
    getSecurityHeaders() {
        return this.nonPublicRequirements
            .map(requirement => this.getAuthParameter(requirement))
            .filter(authParameter => authParameter.isInHeader)
            .map(authParameter => authParameter.toHarItem());
    }
}
class PostDataToHar {
    constructor(requestBody) {
        this.content = (requestBody === null || requestBody === void 0 ? void 0 : requestBody.content) || {};
    }
    encodeURIComponent(value) {
        return encodeURIComponent(value).replace(/\%20/g, '+');
    }
    encodeURIParam(param) {
        param.name = this.encodeURIComponent(param.name);
        param.value = this.encodeURIComponent(param.value);
        return param;
    }
    stringify(value) {
        return typeof value === 'string' ? value : JSON.stringify(value);
    }
    sampleToPayLoad(sample, type) {
        if (sample === undefined) {
            return;
        }
        return this.sampleToFormData(sample, type);
    }
    sampleToFormData(sample, type) {
        if (type === 'multipart/form-data') {
            const params = Object.entries(sample).map(([name, value]) => ({ name: name, value: this.stringify(value) }));
            return {
                mimeType: type,
                params: params,
            };
        }
        return this.sampleToFormUrlEncoded(sample, type);
    }
    sampleToFormUrlEncoded(sample, type) {
        if (type === 'application/x-www-form-urlencoded') {
            const params = Object.entries(sample).map(([name, value]) => this.encodeURIParam({ name, value }));
            return {
                mimeType: type,
                params: params,
                text: params.map(param => `${param.name}=${param.value}`).join('&')
            };
        }
        return this.sampleToJson(sample, type);
    }
    sampleToJson(sample, type) {
        return {
            mimeType: type,
            text: this.stringify(sample)
        };
    }
    get availableContentTypes() {
        return Object.keys(this.content).filter((contentType) => VALID_MIME_TYPES.includes(contentType));
    }
    get availableContents() {
        return this.availableContentTypes
            .map(contentType => ({ mimeType: contentType, schema: this.content[contentType].schema }))
            .filter(content => !!content.schema);
    }
    dataAsArray() {
        this.postDataArray = this.availableContents.map(content => {
            const sample = OpenAPISampler.sample(content.schema);
            return this.sampleToPayLoad(sample, content.mimeType);
        });
        return this.postDataArray;
    }
    toArray() {
        return this.postDataArray || this.dataAsArray();
    }
    get isEmpty() {
        return this.availableContentTypes.length === 0;
    }
}
class MethodToHar {
    constructor(scheme, parent) {
        this.httpVersion = 'HTTP/1.1';
        this.headersSize = 0;
        this.bodySize = 0;
        const parameters = new Parameters(scheme.parameters, parent.parameters);
        const security = new MethodSecurityRequirements(scheme.securityInfo);
        this.baseUrl = scheme.baseUrl;
        this.pathname = parent.path;
        this.httpMethod = scheme.method;
        this.url = `${this.baseUrl}${scheme.pathname}`;
        this.description = scheme.description || 'No description available';
        this.headers = [...parameters.getHeaderParameters(), ...security.getSecurityHeaders()];
        this.queryString = parameters.getQueryParameters();
        this.cookies = parameters.getCookieParameters();
        this.postData = new PostDataToHar(scheme.requestBody);
    }
    metaData(postData) {
        const comment = (postData === null || postData === void 0 ? void 0 : postData.mimeType) || '';
        const headers = (postData === null || postData === void 0 ? void 0 : postData.mimeType) ? [...this.headers, { name: 'content-type', value: postData.mimeType }] : this.headers;
        return { headers, comment };
    }
    methodToHar(postData) {
        const { httpMethod: method, pathname, url, queryString, cookies, httpVersion, headersSize, bodySize } = this;
        const { headers, comment } = this.metaData(postData);
        return Object.assign(Object.assign({ method, pathname, url, headers, queryString, httpVersion, cookies, headersSize, bodySize }, (postData && { postData })), { comment });
    }
    methodAsArray() {
        this.methodArray = this.postData.isEmpty ? [this.methodToHar()] : this.postData.toArray().map(postData => this.methodToHar(postData));
        return this.methodArray;
    }
    toArray() {
        return this.methodArray || this.methodAsArray();
    }
}
class PathToHar {
    constructor(scheme) {
        this.methodsMap = {};
        this.parameters = new Parameters(scheme.parameters);
        this.baseUrl = scheme.baseUrl;
        this.path = scheme.pathname;
        this.url = `${this.baseUrl}${this.path}`;
        this.description = scheme.description || 'No description available';
        scheme.methods.forEach(method => this.createMethods(method));
    }
    createMethods(scheme) {
        const harMethod = new MethodToHar(scheme, this);
        this.methodsMap[scheme.method.toLowerCase()] = harMethod;
    }
    createHarPath(method) {
        const { url, path: pathname, description } = this;
        return { url, pathname, description, method: method.httpMethod, hars: method.toArray() };
    }
    pathAsArray() {
        this.pathArray = this.methods.map(method => this.createHarPath(method));
        return this.pathArray;
    }
    get methods() {
        return Object.values(this.methodsMap);
    }
    get availableMethods() {
        return Object.keys(this.methodsMap);
    }
    getMethod(method) {
        if (!this.methodsMap[method]) {
            throw new errors_1.InvalidMethodError(this.path, method);
        }
        return this.methodsMap[method];
    }
    get get() {
        return this.getMethod('get');
    }
    get put() {
        return this.getMethod('put');
    }
    get post() {
        return this.getMethod('post');
    }
    get delete() {
        return this.getMethod('delete');
    }
    get options() {
        return this.getMethod('options');
    }
    get head() {
        return this.getMethod('head');
    }
    get trace() {
        return this.getMethod('trace');
    }
    get patch() {
        return this.getMethod('patch');
    }
    toArray() {
        return this.pathArray || this.pathAsArray();
    }
}
class ApiToHar {
    constructor(scheme) {
        this.pathsMap = {};
        this.scheme = new openapi_wrapper_1.OpenApiWrapper(scheme);
    }
    getPaths() {
        this.scheme.paths
            .filter(path => !this.pathsMap[path.pathname])
            .forEach(path => this.createPath(path));
        return Object.values(this.pathsMap);
    }
    pathsAsArray() {
        this.pathsArray = [];
        this.pathsArray = this.pathsArray.concat(...this.paths.map(path => path.toArray()));
        return this.pathsArray;
    }
    createPath(path) {
        const harPath = new PathToHar(path);
        this.pathsMap[path.pathname] = harPath;
    }
    get paths() {
        return this.getPaths();
    }
    getPath(path) {
        if (!this.pathsMap[path]) {
            this.createPath(this.scheme.getPath(path));
        }
        return this.pathsMap[path];
    }
    toArray() {
        return this.pathsArray || this.pathsAsArray();
    }
}
exports.ApiToHar = ApiToHar;
