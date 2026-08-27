import { OpenAPIObject } from '@nestjs/swagger';
import { HttpMethod } from './openapi-to-har';
export type Language = 'c' | 'c_libcurl' | 'clojure' | 'clojure_clj_http' | 'csharp' | 'csharp_restsharp' | 'csharp_httpclient' | 'go' | 'go_native' | 'http' | 'http_1.1' | 'java' | 'java_okhttp' | 'java_unirest' | 'java_asynchttp' | 'java_nethttp' | 'javascript' | 'javascript_jquery' | 'javascript_fetch' | 'javascript_xhr' | 'javascript_axios' | 'kotlin' | 'kotlin_okhttp' | 'node' | 'node_native' | 'node_request' | 'node_unirest' | 'node_axios' | 'node_fetch' | 'objc' | 'objc_nsurlsession' | 'ocaml' | 'ocaml_cohttp' | 'php' | 'php_curl' | 'php_http1' | 'php_http2' | 'powershell' | 'powershell_webrequest' | 'powershell_restmethod' | 'python' | 'python_python3' | 'python_requests' | 'r' | 'r_httr' | 'ruby' | 'ruby_native' | 'shell' | 'shell_curl' | 'shell_httpie' | 'shell_wget' | 'swift' | 'swift_nsurlsession';
export interface LanguageMeta {
    language: string;
    library: string;
    title: string;
}
export interface Snippet {
    id: LanguageMeta;
    mimeType: string;
    title: string;
    content: string;
}
export interface MethodSnippet {
    method: string;
    url: string;
    description: string;
    resource: string;
    snippets: Snippet[];
}
export declare function getEndpointSnippets(openApi: OpenAPIObject, path: string, method: HttpMethod, targets: Language[]): MethodSnippet;
export declare function getSnippets(openApi: OpenAPIObject, targets: Language[]): MethodSnippet[];
