import { OpenAPIObject } from '@nestjs/swagger';
import { PathItemObject, OperationObject, SecurityRequirementObject, SecuritySchemeObject, RequestBodyObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
export declare const VALID_METHODS: readonly ["get", "post", "put", "delete", "patch", "options", "head", "trace"];
export type HttpMethod = typeof VALID_METHODS[number];
export interface SecurityInfo {
    requirements: string[];
    getSecurityScheme(id: string): SecuritySchemeObject;
}
export interface OperationObjectWrapper extends OperationObject {
    baseUrl: string;
    method: HttpMethod;
    pathname: string;
    requestBody?: RequestBodyObject;
    securityInfo: SecurityInfo;
    securityRequirements: string[];
}
export interface PathItemObjectWrapper extends PathItemObject {
    baseUrl: string;
    pathname: string;
    methods: OperationObjectWrapper[];
    get?: OperationObjectWrapper;
    put?: OperationObjectWrapper;
    post?: OperationObjectWrapper;
    delete?: OperationObjectWrapper;
    options?: OperationObjectWrapper;
    head?: OperationObjectWrapper;
    patch?: OperationObjectWrapper;
    trace?: OperationObjectWrapper;
}
export declare class OpenApiWrapper {
    #private;
    constructor(openApi: OpenAPIObject);
    get paths(): PathItemObjectWrapper[];
    get availablePaths(): string[];
    get security(): SecurityRequirementObject[];
    get securityRequirements(): string[];
    get baseUrl(): string;
    private resolveRef;
    private resolveScheme;
    private resolveRequestBodyReferences;
    private resolveBaseUrl;
    private createOperation;
    private createPath;
    private securityToRequirements;
    private securityToStrings;
    getSecurityScheme(id: string): SecuritySchemeObject;
    getPath(pathname: string): PathItemObjectWrapper;
}
