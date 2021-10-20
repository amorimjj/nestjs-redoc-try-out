<p align="center">
  <img src="./nestjs-redoc-try-out.png" height="166" alt="NestJS Redoc Try Out Module" />
</p>
<p align="center">
    An unofficial <a href="https://nestjs.com">NestJS</a> module for <a href="https://www.npmjs.com/package/redoc-try-it-out">Redoc Try Out</a>
</p>

<div align="center">

[Description](#Description) |
[Features](#Features) |
[Installation](#Installation) |
[How to use](#How-to-use) |
[Available Options](#Available-options) |
[Credits](#Credits) |
[Changelog](#Changelog) |
[TODO](#TODO)

</div>

## Description
NestJS-Redoc-Try-Out is an unofficial [NestJS](https://nestjs.com) module for [Redoc Try Out](https://www.npmjs.com/package/redoc-try-it-out).
It provides an easy way plugging in [Redoc](https://github.com/Redocly/redoc) in a NestJS application.

## Features
- Provides a try out option implemented by [Redoc Try Out](https://www.npmjs.com/package/redoc-try-it-out)
- Automatic code snippet generation 

## Installation

`npm i nestjs-redoc-try-out`

## How to use

Redoc it's just a fancy frontend for display [OpenApi](https://swagger.io/specification/) documentation.
In order to get your api documented, [SwaggerWrapper Module](https://github.com/nestjs/swagger) is required and the official [NestJS OpenApi Guide](https://docs.nestjs.com/openapi/introduction) must be followed.


```typescript
...

import { RedocTryOutModule, RedocModuleOptions } from 'nestjs-redoc-try-out';

async function bootstrap() {
    ...
    const app = ... //create NestJS application
    const config = new DocumentBuilder() // documenting the api
    const document = SwaggerModule.createDocument(app, config);

    const options: RedocOptions = { /** see: available options */ };
    // Instead of using SwaggerModule.setup() you call this module
    await RedocTryOutModule.setup('/docs', app, document, options);
    ...
}

bootstrap();
```

## Available options

### RedocTryOutModule Setup Options
| Option                  | Description                     | Type                                                                              | 
| ----------------------- | ------------------------------- | --------------------------------------------------------------------------------- | 
| path                    | The path to mount the Redoc UI  | string                                                                            | 
| app                     | An application instance         | [INestApplication](https://docs.nestjs.com/first-steps)                           | 
| document                | URL swagger's spec file         | [OpenAPIObject](https://docs.nestjs.com/openapi/introduction#document-options)    | 
| options (optional)      | Redoc try it out config options | [RedocTryItOutOptions](#Redoc-Try-It-Out-Options)                                 | 

### Redoc Options
RedocOptions extends <i>RedocTryItOutOptions</i>, documented on [Redoc Try Out Documentation](https://www.npmjs.com/package/redoc-try-it-out#redoc-try-it-out-options)

```typescript
export interface RedocModuleOptions extends RedocOptions {

  /**
   *  Web site title
   *  default: document.info.title || document.info.description || 'Online documentation'
   */
  title?: string;
  
  /** Web site favicon URL */
  favicon?: string;

  /** Name of the swagger json spec file. default: 'swagger' */
  docName?: string;

  /** Skip generation of code snippets: default: false */
  skipSnippetsGeneration?: boolean;

  /**
   *  Languages used on code generation snippets.
   *  default: ['javascript']
   *  Language = 'c'| 'c_libcurl'| 'clojure'| 'clojure_clj_http'| 'csharp'| 'csharp_restsharp'| 'csharp_httpclient'| 'go'| 'go_native'|'http'|'http_1.1'|'java'|'java_okhttp'|'java_unirest'|'java_asynchttp'|'java_nethttp'|'javascript'|'javascript_jquery'|'javascript_fetch'|'javascript_xhr'|'javascript_axios'|'kotlin'|'kotlin_okhttp'|'node'|'node_native'|'node_request'|'node_unirest'|'node_axios'|'node_fetch'|'objc'|'objc_nsurlsession'|'ocaml'|'ocaml_cohttp'|'php'|'php_curl'|'php_http1'|'php_http2'|'powershell'|'powershell_webrequest'|'powershell_restmethod'|'python'|'python_python3'|'python_requests'|'r'|'r_httr'|'ruby'|'ruby_native'|'shell'|'shell_curl'|'shell_httpie'|'shell_wget'|'swift'|'swift_nsurlsession'
   */
  codeSnippetsLanguages?: Language[];

  /** Authentication options - not implemented yet */
  auth?: {
    enabled: boolean;
    user: string;
    password: string;
  };
  
  /**
   * Group tags in categories in the side menu.
   * Tags not added to a group will not be displayed.
   * default: document.tags
   */
  tagGroups?: TagGroupOptions[];

  /** Logo Options */
  logo?: LogoOptions;
}

export interface LogoOptions {
  /** 
   * The URL pointing to the spec logo
   *  Format: Absolute URL
   */
  url?: string;
  
  /** Background color. Format: RGB color in hexadecimal format (e.g: #0000ff) */
  backgroundColor?: string;
  
  /** Alt tag for logo */
  altText?: string;
  
  /** href tag for logo. */
  href?: string;
}

export interface TagGroupOptions {
  name: string;
  tags: string[];
}
```

## Credits

It's based on [nestjs-redoc](https://www.npmjs.com/package/nestjs-redoc) work.

## Changelog

Bellow are a list of changes, some might go undocumented

- 1.0.0 - First release

## TODO
- Add Fastify support
- Implement authentication
- Refactoring code gen