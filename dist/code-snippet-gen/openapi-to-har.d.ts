import { OpenAPIObject } from '@nestjs/swagger';
import { RequestBodyObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { HttpMethod } from './openapi-wrapper';
export { HttpMethod } from './openapi-wrapper';
declare const VALID_MIME_TYPES: readonly ["application/json", "application/xml", "application/x-www-form-urlencoded", "multipart/form-data"];
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
    method: HttpMethod;
    pathname: string;
    hars: IHarMethod[];
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
    postData?: {
        mimeType?: string;
        text?: string;
        params?: IHarItem[];
    };
    queryString: IHarItem[];
}
export interface IHarPostData {
    mimeType?: MimeType;
    text?: string;
    params?: {
        name: string;
        value: string;
    }[];
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
declare class PostDataToHar {
    private content;
    private postDataArray;
    constructor(requestBody: RequestBodyObject);
    private encodeURIComponent;
    private encodeURIParam;
    private stringify;
    private sampleToPayLoad;
    private sampleToFormData;
    private sampleToFormUrlEncoded;
    private sampleToJson;
    private get availableContentTypes();
    private get availableContents();
    private dataAsArray;
    toArray(): IHarPostData[];
    get isEmpty(): boolean;
}
export declare class ApiToHar {
    private scheme;
    private pathsMap;
    private pathsArray;
    constructor(scheme: OpenAPIObject);
    private getPaths;
    private pathsAsArray;
    private createPath;
    get paths(): IPathToHar[];
    getPath(path: string): IPathToHar;
    toArray(): IHarPath[];
}
