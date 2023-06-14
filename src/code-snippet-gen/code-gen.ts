import { OpenAPIObject } from '@nestjs/swagger';
import HTTPSnippet from 'httpsnippet';
import { InvalidLanguageError } from './errors';
import {
    ApiToHar,
    HttpMethod,
    IHarMethod,
    IMethodToHar
} from './openapi-to-har';

export type Language =
  | 'c'
  | 'c_libcurl'
  | 'clojure'
  | 'clojure_clj_http'
  | 'csharp'
  | 'csharp_restsharp'
  | 'csharp_httpclient'
  | 'go'
  | 'go_native'
  | 'http'
  | 'http_1.1'
  | 'java'
  | 'java_okhttp'
  | 'java_unirest'
  | 'java_asynchttp'
  | 'java_nethttp'
  | 'javascript'
  | 'javascript_jquery'
  | 'javascript_fetch'
  | 'javascript_xhr'
  | 'javascript_axios'
  | 'kotlin'
  | 'kotlin_okhttp'
  | 'node'
  | 'node_native'
  | 'node_request'
  | 'node_unirest'
  | 'node_axios'
  | 'node_fetch'
  | 'objc'
  | 'objc_nsurlsession'
  | 'ocaml'
  | 'ocaml_cohttp'
  | 'php'
  | 'php_curl'
  | 'php_http1'
  | 'php_http2'
  | 'powershell'
  | 'powershell_webrequest'
  | 'powershell_restmethod'
  | 'python'
  | 'python_python3'
  | 'python_requests'
  | 'r'
  | 'r_httr'
  | 'ruby'
  | 'ruby_native'
  | 'shell'
  | 'shell_curl'
  | 'shell_httpie'
  | 'shell_wget'
  | 'swift'
  | 'swift_nsurlsession';

interface Target {
  key: string;
  title: string;
}

interface LanguageTarget {
  clients: Target[];
  default: string;
}

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

class Snippets {
  private static getClient(target: LanguageTarget, clientKey: string): Target {
    const client = target.clients.find((client) => client.key === clientKey);
    return client || Snippets.getClient(target, target.default);
  }

  private static getTarget(language: Language): LanguageMeta {
    const [key, clientKey] = language.split('_');
    const target = HTTPSnippet.availableTargets.find(
      (target) => target === key,
    );

    if (!target) {
      throw new InvalidLanguageError(language);
    }
    const languageTarget: LanguageTarget = {
      default: target,
      clients: [{ key: target, title: target }],
    };

    const client = Snippets.getClient(languageTarget, clientKey);
    return {
      language: target,
      library: client.key,
      title: `${target} + ${client.title}`,
    };
  }

  private static createSnippet(
    target: LanguageMeta,
    snippet: HTTPSnippet,
    mimeType: string,
  ): Snippet {
    const mime = mimeType ?? 'application/json';
    return {
      id: target,
      ...{ mimeType: mime },
      title: target.title,
      content: snippet.convert(target.language, target.library).toString(),
    };
  }

  private static withoutPostDataParams(har: IHarMethod): IHarMethod {
    return {
      ...har,
      postData: {
        mimeType: har.postData?.mimeType ?? 'application/json',
        text: har.postData?.text ?? '',
        params: [],
      },
    };
  }

  private static createSnippets(
    target: LanguageMeta,
    hars: IHarMethod[],
    snippets: Snippet[],
  ): void {
    snippets.push(
      ...hars.map((har: IHarMethod) => {
        const harEmbellished = Snippets.withoutPostDataParams(har);
        return Snippets.createSnippet(
          target,
          new HTTPSnippet(harEmbellished),
          har.postData?.mimeType ?? 'application/json',
        );
      }),
    );
  }

  public static create(languages: Language[], hars: IHarMethod[]): Snippet[] {
    const snippets: Snippet[] = [];
    const targets = languages.map((language) => Snippets.getTarget(language));
    targets.forEach((target) =>
      Snippets.createSnippets(target, hars, snippets),
    );
    return snippets;
  }
}

function getResourceName(url: string): string {
  const pathComponents = url.split('/').reverse();
  const resourceName = pathComponents.find(
    (component: string) => !!component && !/^{/.test(component),
  );
  if (!resourceName) {
    throw new Error(`Could not find resource name in url: ${url}`);
  }
  return resourceName;
}

function getMethodSnippets(
  methodHar: IMethodToHar,
  targets: Language[],
): MethodSnippet {
  const snippets = Snippets.create(targets, methodHar.toArray());
  return {
    method: methodHar.httpMethod,
    url: methodHar.url,
    description: methodHar?.description ?? '',
    resource: getResourceName(methodHar.url),
    snippets: snippets,
  };
}

export function getEndpointSnippets(
  openApi: OpenAPIObject,
  path: string,
  method: HttpMethod,
  targets: Language[],
): MethodSnippet {
  const methodHar = new ApiToHar(openApi).getPath(path).getMethod(method);
  return getMethodSnippets(methodHar, targets);
}

export function getSnippets(
  openApi: OpenAPIObject,
  targets: Language[],
): MethodSnippet[] {
  const apiToHar = new ApiToHar(openApi);
  const results: any[] = [];
  apiToHar.paths.forEach((path) =>
    results.push(
      ...path.methods.map((method) => getMethodSnippets(method, targets)),
    ),
  );
  return results;
}
