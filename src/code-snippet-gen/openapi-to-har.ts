import * as OpenAPISampler from 'openapi-sampler';
import { OpenAPIObject } from '@nestjs/swagger';
import { ParameterObject, SecuritySchemeObject, RequestBodyObject, SchemaObject, ContentObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { InvalidAuthTypeError, InvalidMethodError } from './errors';
import { OpenApiWrapper, PathItemObjectWrapper, OperationObjectWrapper, HttpMethod, SecurityInfo } from './openapi-wrapper';

export { HttpMethod } from './openapi-wrapper';

const VALID_MIME_TYPES = ['application/json', 'application/xml', 'application/x-www-form-urlencoded', 'multipart/form-data'] as const;
type MimeType = typeof VALID_MIME_TYPES[number];

interface IHar {
    url: string;
    description?: string;
}

export interface IHarItem {
    name: string;
    value: string;
}

export interface IHarPath extends IHar {
    method: HttpMethod,
    pathname: string;
    hars: IHarMethod[]
}

export interface IHarMethod extends IHar {
    bodySize: number;
    comment: string;
    cookies: IHarItem[];
    headers: IHarItem[];
    headersSize: number;
    httpVersion: string;
    method: HttpMethod;
    pathname: string;
    postData?: { mimeType: string, text: string, params?: IHarItem[] };
    queryString: IHarItem[];
}

export interface IHarPostData {
    mimeType?: MimeType;
    text?: string;
    params?: { name: string, value: string}[];
}

export interface IParameters {
    getHeaderParameters(): IHarItem[];
    getQueryParameters(): IHarItem[];
    getCookieParameters(): IHarItem[];
}

export interface IMethodToHar {
    cookies: IHarItem[];
    description?: string;
    headers: IHarItem[];
    httpMethod: HttpMethod;
    httpVersion: string;
    pathname: string;
    postData: PostDataToHar;
    queryString: IHarItem[];
    url: string;
    toArray(): IHarMethod[];
}

export interface IPathToHar {
    parameters: IParameters;
    baseUrl: string;
    path: string;
    url: string;
    description: string;
    methods: IMethodToHar[];
    availableMethods: string[];
    get: IMethodToHar;
    put: IMethodToHar;
    post: IMethodToHar;
    delete: IMethodToHar;
    options: IMethodToHar;
    head: IMethodToHar;
    trace: IMethodToHar;
    patch: IMethodToHar;
    getMethod(method: HttpMethod): IMethodToHar;
    toArray(): IHarPath[];
}

abstract class ParameterItem<Scheme extends ParameterObject|SecuritySchemeObject> implements IHarItem {
    protected readonly scheme:Scheme;

    name: string;
    value: string;

    constructor(scheme:Scheme) {
        this.scheme = scheme;
        this.setName();
        this.setValue();
    }

    public get in(): string {
        return this.scheme['in']?.toLowerCase() || '';
    }

    public get isHeader(): boolean {
        return this.in === 'header';
    }

    public get isQuery(): boolean {
        return this.in === 'query';
    }

    public get isCookie(): boolean {
        return this.in === 'cookie';
    }

    protected abstract setName(): void;
    protected abstract setValue(): void;

    public isEqualTo(paramenter: ParameterItem<Scheme>) {
        return this.name === paramenter.name && this.in === paramenter.in;
    }

    public toHarItem(): IHarItem {
        return { name: this.name, value: this.value }
    }
} 

class AuthParameterToHar extends ParameterItem<SecuritySchemeObject> {

    public get isInHeader(): boolean {
        return !this.isApikey || this.isHeader;
    }

    private get authType(): string {
        const authType = this.scheme.type.toLowerCase();
        return authType === 'http' ? this.scheme.scheme?.toLowerCase() ?? 'http' : authType;
    }

    private get isApikey(): boolean {
        return this.authType === 'apikey';
    }
    
    constructor(securityScheme: SecuritySchemeObject) {
        super(securityScheme);

        const validAuthTypes = ['basic', 'apikey', 'oauth2', 'bearer'];

        if ( !validAuthTypes.includes(this.authType ) ) {
            throw new InvalidAuthTypeError(this.authType);
        }
    }

    private getApiKeySchemeName(): string {
        return this.isApikey && this.scheme.name ? this.scheme.name : '';
    }

    private getApiKeyHeaderValue(): string {
        return this.isApikey ? 'REPLACE_KEY_VALUE' : '';
    }

    private getTokenHeaderValue(): string {
        return this.authType === 'basic' ? 'Basic REPLACE_BASIC_AUTH' : 'Bearer REPLACE_BEARER_TOKEN';
    }

    protected setName(): void {
        this.name = this.getApiKeySchemeName() || 'Authorization';
    }

    protected setValue(): void {
        this.value = this.getApiKeyHeaderValue() || this.getTokenHeaderValue();
    }
}

class ParameterToHar extends ParameterItem<ParameterObject> {

    private get type(): string {
        return this.scheme?.schema && (this.scheme?.schema as any)['type'];
    }

    private get example(): string {
        return this.scheme.example || '';
    }

    private get default(): string {
        return (
            (this.scheme?.schema && (this.scheme?.schema as any)['default'])
            || this.example
        );
    }

    protected setName(): void {
        this.name = this.scheme.name;
    }

    protected setValue(): void {
        this.value = this.default || `SOME_${this.type.toUpperCase()}_VALUE`;
    }
}

class Parameters implements IParameters {

    private parent?: Parameters;

    private parameters: ParameterToHar[];

    constructor(parameters: ParameterObject[], parent?: Parameters) {
        this.parameters = ((parameters||[]).map(param => new ParameterToHar(param)));
        this.parent = parent;
    }

    private merge(parameters: ParameterToHar[], parentParameters?: ParameterToHar[]): IHarItem[] {
        (parentParameters || []).forEach(parentParameter => {
            if ( !parameters.find(parameter => parameter.isEqualTo(parentParameter)) ) {
                parameters.push(parentParameter);
            }
        });
        return parameters.map(param => param.toHarItem())
    }

    protected get headerParameters(): ParameterToHar[] {
        return this.parameters.filter(param => param.isHeader);
    }

    protected get queryParameters(): ParameterToHar[] {
        return this.parameters.filter(param => param.isQuery);
    }

    protected get cookieParameters(): ParameterToHar[] {
        return this.parameters.filter(param => param.isCookie);
    }

    public getHeaderParameters(): IHarItem[] {
        return this.merge(this.headerParameters, this.parent?.headerParameters);
    }

    public getQueryParameters(): IHarItem[] {
        return this.merge(this.queryParameters, this.parent?.queryParameters);
    }

    public getCookieParameters(): IHarItem[] {
        return this.merge(this.cookieParameters, this.parent?.cookieParameters);
    }
}

class MethodSecurityRequirements {

    private securityInfo: SecurityInfo;

    constructor(securityInfo: SecurityInfo) {
        this.securityInfo = securityInfo;
    }

    protected getAuthParameter(id: string): AuthParameterToHar {
        const scheme = this.securityInfo.getSecurityScheme(id);
        return new AuthParameterToHar(scheme);
    }

    protected get nonPublicRequirements(): string[] {
        return this.securityInfo.requirements.filter(requirement => requirement !== 'public');
    }

    public getSecurityHeaders(): IHarItem[] {
        return this.nonPublicRequirements
            .map(requirement => this.getAuthParameter(requirement))
            .filter(authParameter => authParameter.isInHeader)
            .map(authParameter => authParameter.toHarItem());
    }
}

class PostDataToHar {

    private content: ContentObject;
    private postDataArray: IHarPostData[];

    constructor(requestBody: RequestBodyObject) {
        this.content = requestBody?.content || {};
    }

    private encodeURIComponent(value: string): string {
        return encodeURIComponent(value).replace(/\%20/g, '+')
    }

    private encodeURIParam(param: { name: string, value: string }): { name: string, value: string } {
        param.name = this.encodeURIComponent(param.name);
        param.value = this.encodeURIComponent(param.value);
        return param;
    }

    private stringify(value: any): string {
        return typeof value === 'string' ? value : JSON.stringify(value)
    }

    private sampleToPayLoad(sample: Record<string, string>, type: MimeType): IHarPostData {
        if ( sample === undefined ) {
            throw new Error('Sample is undefined');
        }
        return this.sampleToFormData(sample, type);
    }

    private sampleToFormData(sample: Record<string, string>, type: MimeType): IHarPostData {
        if ( type === 'multipart/form-data' ) {
            const params = Object.entries(sample).map(([name, value]) => (
                { name: name, value: this.stringify(value) }
            ));
            return {
                mimeType: type,
                params: params,
            };
        }

        return this.sampleToFormUrlEncoded(sample, type);
    }

    private sampleToFormUrlEncoded(sample: Record<string, string>, type: MimeType): IHarPostData {
        if ( type === 'application/x-www-form-urlencoded' ) {
            const params = Object.entries(sample).map(([name, value]) => this.encodeURIParam({ name, value }));
            return {
                mimeType: type,
                params: params,
                text: params.map(param => `${param.name}=${param.value}`).join('&')
            }
        }

        return this.sampleToJson(sample, type);
    }

    private sampleToJson(sample: Record<string, string>, type: MimeType): IHarPostData {
        return {
            mimeType: type,
            text: this.stringify(sample)
        };
    }

    private get availableContentTypes(): string[] {
        return Object.keys(this.content).filter(
            (contentType: MimeType) => VALID_MIME_TYPES.includes(contentType)
        );
    }

    private get availableContents(): { mimeType: MimeType, schema: SchemaObject }[] {
        return this.availableContentTypes
            .map(contentType => ({ mimeType: contentType as MimeType, schema: this.content[contentType].schema as SchemaObject }))
            .filter(content => !!content.schema);
    }

    private dataAsArray(): IHarPostData[] {
        this.postDataArray = this.availableContents.map(content => {
            const sample = OpenAPISampler.sample(content.schema as any);
            return this.sampleToPayLoad(sample as any, content.mimeType);
        });
        return this.postDataArray;
    }

    public toArray(): IHarPostData[] {
        return this.postDataArray||this.dataAsArray();
    }

    get isEmpty(): boolean {
        return this.availableContentTypes.length === 0;
    }
}

class MethodToHar implements IMethodToHar {

    private readonly baseUrl: string;
    public readonly pathname: string;
    public readonly url: string;
    public readonly httpMethod: HttpMethod;
    public readonly headers: IHarItem[];
    public readonly queryString: IHarItem[];
    public readonly cookies: IHarItem[];
    public readonly postData: PostDataToHar;
    public readonly description?: string;

    public readonly httpVersion: string = 'HTTP/1.1';

    private readonly headersSize: number = 0;
    private readonly bodySize: number = 0;
    
    private methodArray: IHarMethod[];

    constructor(scheme: OperationObjectWrapper, parent: PathToHar) {
        const parameters = new Parameters(scheme.parameters as ParameterObject[], parent.parameters);
        const security = new MethodSecurityRequirements(scheme.securityInfo);
        this.baseUrl = scheme.baseUrl;
        this.pathname = parent.path;
        this.httpMethod = scheme.method;
        this.url = `${this.baseUrl}${scheme.pathname}`;
        this.description = scheme.description || 'No description available';
        this.headers = [...parameters.getHeaderParameters(), ...security.getSecurityHeaders()];
        this.queryString = parameters.getQueryParameters();
        this.cookies = parameters.getCookieParameters();
        this.postData = new PostDataToHar(scheme.requestBody ?? { content: { 'default': {}}});
    }

    private metaData(postData?: IHarPostData): { headers: IHarItem[], comment: string } {
        const comment = postData?.mimeType || '';
        const headers = postData?.mimeType ? [...this.headers, { name: 'content-type', value: postData.mimeType }] : this.headers;
        return { headers, comment }
    }

    private methodToHar(postData: IHarPostData): IHarMethod {
        const { httpMethod: method, pathname, url, queryString, cookies, httpVersion, headersSize, bodySize } = this;
        const { headers, comment } = this.metaData(postData);
        const postDataObj = Object.assign({}, postData);
        const { mimeType, ...restOfPostDataObj } = postData ?? {
          ...postDataObj,
        };
        return {
          method,
          pathname,
          url,
          headers,
          queryString,
          httpVersion,
          cookies,
          headersSize,
          bodySize,
          ...(restOfPostDataObj && { restOfPostDataObj }),
          comment,
        };
    }

    private methodAsArray(): IHarMethod[] {
        this.methodArray = this.postData.isEmpty ? [ this.methodToHar({}) ] : this.postData.toArray().map(postData => this.methodToHar(postData))
        return this.methodArray;
    }

    public toArray(): IHarMethod[] {
        return this.methodArray||this.methodAsArray();
    }
}

class PathToHar implements IPathToHar {

    private methodsMap: { [method: string] : IMethodToHar } = {};
    private pathArray: IHarPath[];

    public readonly parameters: Parameters;
    public readonly baseUrl: string;
    public readonly path: string;
    public readonly url: string;
    public readonly description: string;

    constructor(scheme: PathItemObjectWrapper) {
        this.parameters = new Parameters(scheme.parameters as ParameterObject[]);
        this.baseUrl = scheme.baseUrl;
        this.path = scheme.pathname;
        this.url = `${this.baseUrl}${this.path}`;
        this.description = scheme.description || 'No description available';
        scheme.methods.forEach(method => this.createMethods(method));
    }

    private createMethods(scheme: OperationObjectWrapper): void {
        const harMethod = new MethodToHar(scheme, this);
        this.methodsMap[scheme.method.toLowerCase()] = harMethod;
    }

    private createHarPath(method: IMethodToHar): IHarPath {
        const { url, path: pathname, description } = this;
        return { url, pathname, description, method: method.httpMethod, hars: method.toArray() }
    }

    private pathAsArray(): IHarPath[] {
        this.pathArray = this.methods.map(method => this.createHarPath(method));
        return this.pathArray;
    }

    public get methods(): IMethodToHar[] {
        return Object.values(this.methodsMap);
    }

    public get availableMethods(): string[] {
        return Object.keys(this.methodsMap);
    }

    public getMethod(method: HttpMethod): IMethodToHar {
        if ( !this.methodsMap[method] ) {
            throw new InvalidMethodError(this.path, method);
        }
        return this.methodsMap[method];
    }

    public get get(): IMethodToHar {
        return this.getMethod('get');
    }

    public get put(): IMethodToHar {
        return this.getMethod('put');
    }

    public get post(): IMethodToHar {
        return this.getMethod('post');
    }

    public get delete(): IMethodToHar {
        return this.getMethod('delete');
    }

    public get options(): IMethodToHar {
        return this.getMethod('options');
    }

    public get head(): IMethodToHar {
        return this.getMethod('head');
    }

    public get trace(): IMethodToHar {
        return this.getMethod('trace');
    }

    public get patch(): IMethodToHar {
        return this.getMethod('patch');
    }

    public toArray(): IHarPath[] {
        return this.pathArray||this.pathAsArray();
    }
}

export class ApiToHar {

    private scheme: OpenApiWrapper;

    private pathsMap: { [path: string] : PathToHar } = {};
    private pathsArray: IHarPath[];

    constructor(scheme: OpenAPIObject) {
        this.scheme = new OpenApiWrapper(scheme);
    }

    private getPaths(): PathToHar[] {
        this.scheme.paths
            .filter(path => !this.pathsMap[path.pathname])
            .forEach(path => this.createPath(path));
        return Object.values(this.pathsMap)
    }

    private pathsAsArray(): IHarPath[] {
        this.pathsArray = [];
        this.pathsArray = this.pathsArray.concat(...this.paths.map(path => path.toArray()));
        return this.pathsArray;
    }

    private createPath(path: PathItemObjectWrapper): void {
        const harPath = new PathToHar(path);
        this.pathsMap[path.pathname] = harPath;
    }

    public get paths(): IPathToHar[] {
        return this.getPaths();
    }

    public getPath(path: string): IPathToHar {
        if ( !this.pathsMap[path]) {
            this.createPath(this.scheme.getPath(path))
        }
        return this.pathsMap[path];
    }

    public toArray(): IHarPath[] {
        return this.pathsArray||this.pathsAsArray();
    }
}