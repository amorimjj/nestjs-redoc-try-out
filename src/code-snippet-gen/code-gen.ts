import HTTPSnippet from 'httpsnippet';
import { OpenAPIObject } from '@nestjs/swagger';
import * as OpenAPIToHar from './openapi-to-har';

export type Language = 'c'| 'c_libcurl'| 'clojure'| 'clojure_clj_http'| 'csharp'| 'csharp_restsharp'| 'csharp_httpclient'| 'go'| 'go_native'|'http'|'http_1.1'|'java'|'java_okhttp'|'java_unirest'|'java_asynchttp'|'java_nethttp'|'javascript'|'javascript_jquery'|'javascript_fetch'|'javascript_xhr'|'javascript_axios'|'kotlin'|'kotlin_okhttp'|'node'|'node_native'|'node_request'|'node_unirest'|'node_axios'|'node_fetch'|'objc'|'objc_nsurlsession'|'ocaml'|'ocaml_cohttp'|'php'|'php_curl'|'php_http1'|'php_http2'|'powershell'|'powershell_webrequest'|'powershell_restmethod'|'python'|'python_python3'|'python_requests'|'r'|'r_httr'|'ruby'|'ruby_native'|'shell'|'shell_curl'|'shell_httpie'|'shell_wget'|'swift'|'swift_nsurlsession';

export function getEndpointSnippets(openApi: OpenAPIObject, path: string, method: string, targets: Language[], values?: any) {
    // if optional parameter is not provided, set it to empty object
    if (typeof values === 'undefined') {
        values = {};
    }

    const hars = OpenAPIToHar.getEndpoint(openApi, path, method, values);

    const snippets = [];
    for (const har of hars) {
        const snippet = new HTTPSnippet(har);
        snippets.push(
            ...getSnippetsForTargets(
                targets,
                snippet,
                har.comment ? har.comment : undefined
            )
        );
    }

    // use first element since method, url, and description
    // are the same for all elements
    return {
        method: hars[0].method,
        url: hars[0].url,
        description: hars[0].description,
        resource: getResourceName(hars[0].url),
        snippets: snippets,
    };
};

/**
 * Return snippets for all endpoints in the given OpenAPI document.
 *
 * @param {object} openApi  OpenAPI document
 * @param {array} targets   List of languages to create snippets in, e.g,
 *                          ['cURL', 'Node']
 */
export function getSnippets(openApi, targets) {
    const endpointHarInfoList = OpenAPIToHar.getAll(openApi);

    const results = [];
    for (let i in endpointHarInfoList) {
        // create HTTPSnippet object:
        const harInfo = endpointHarInfoList[i];
        const snippets = [];
        for (const har of harInfo.hars) {
            const snippet = new HTTPSnippet(har);
            snippets.push(...getSnippetsForTargets(targets, snippet, har.comment));
        }

        results.push({
            method: harInfo.method,
            url: harInfo.url,
            description: harInfo.description,
            resource: getResourceName(harInfo.url),
            snippets,
        });
    }

    // sort results:
    results.sort((a, b) => {
        if (a.resource < b.resource) {
            return -1;
        } else if (a.resource > b.resource) {
            return 1;
        } else {
            return getMethodOrder(a.method.toLowerCase(), b.method.toLowerCase());
        }
    });

    return results;
};

/**
 * Determine the order of HTTP methods.
 *
 * @param  {string} a One HTTP verb in lower case
 * @param  {string} b Another HTTP verb in lower case
 * @return {number}   The order instruction for the given HTTP verbs
 */
const getMethodOrder = function (a, b) {
    const order = ['get', 'post', 'put', 'delete', 'patch'];
    if (order.indexOf(a) === -1) {
        return 1;
    } else if (order.indexOf(b) === -1) {
        return -1;
    } else if (order.indexOf(a) < order.indexOf(b)) {
        return -1;
    } else if (order.indexOf(a) > order.indexOf(b)) {
        return 1;
    } else {
        return 0;
    }
};

/**
 * Determines the name of the resource exposed by the method.
 * E.g., ../users/{userId} --> users
 *
 * @param  {string} urlStr The OpenAPI path definition
 * @return {string}        The determined resource name
 */
const getResourceName = function (urlStr) {
    const pathComponents = urlStr.split('/');
    for (let i = pathComponents.length - 1; i >= 0; i--) {
        const cand = pathComponents[i];
        if (cand !== '' && !/^{/.test(cand)) {
            return cand;
        }
    }
};

/**
 * Format the given target by splitting up language and library and making sure
 * that HTTP Snippet supports them.
 *
 * @param  {string} targetStr String defining a target, e.g., node_request
 * @return {object}           Object with formatted target, or null
 */
const formatTarget = function (targetStr) {
    const language = targetStr.split('_')[0];
    const title = capitalizeFirstLetter(language);
    let library = targetStr.split('_')[1];

    const validTargets = HTTPSnippet.availableTargets();
    let validLanguage = false;
    let validLibrary = false;
    for (let i in validTargets) {
        const target = validTargets[i];
        if (language === target.key) {
            validLanguage = true;
            if (typeof library === 'undefined') {
                library = target.default;
                validLibrary = true;
            } else {
                for (let j in target.clients) {
                    const client = target.clients[j];
                    if (library === client.key) {
                        validLibrary = true;
                        break;
                    }
                }
            }
        }
    }

    if (!validLanguage || !validLibrary) {
        return null;
    }

    return {
        title:
            typeof library !== 'undefined'
                ? title + ' + ' + capitalizeFirstLetter(library)
                : title,
        language,
        library,
    };
};

/**
 * Generate code snippets for each of the supplied targets
 *
 * @param targets {array}               List of language targets to generate code for
 * @param snippet {Object}              Snippet object from httpsnippet to convert into the target objects
 * @param mimeType {string | undefined} Additional information to add uniqueness to the produced snippets
 */
const getSnippetsForTargets = function (targets, snippet, mimeType) {
    const snippets = [];
    for (let target of targets) {
        target = formatTarget(target);
        if (!target) throw new Error('Invalid target: ' + target);
        snippets.push({
            id: target,
            ...(mimeType !== undefined && { mimeType: mimeType }),
            title: target.title,
            content: snippet.convert(
                target.language,
                typeof target.library !== 'undefined' ? target.library : null
            ),
        });
    }
    return snippets;
};

const capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
