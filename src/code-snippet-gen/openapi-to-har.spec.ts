import { OpenAPIObject } from '@nestjs/swagger';
import { ApiToHar } from './openapi-to-har';

describe('Openapi to har', () => {

    let openApi:OpenAPIObject;

    beforeEach(() => {
        openApi = {
            openapi: "3.0.0",
            paths: {
                "/api/auth/login":{
                    "post":{
                       "operationId":"AuthController_login",
                       "summary":"Loggin an user",
                       "parameters":[],
                       "requestBody":{
                          "required":true,
                          "content":{
                             "application/json":{
                                "schema":{
                                   "$ref":"#/components/schemas/LoginRequest"
                                }
                             }
                          }
                       },
                       "responses":{
                          "200":{
                             "description":"User session information",
                             "content":{
                                "application/json":{
                                   "schema":{
                                      "$ref":"#/components/schemas/LoginResponse"
                                   }
                                }
                             }
                          },
                          "401":{ "description":""}
                       },
                       "tags":[ "auth" ],
                    }
                },
                "/api/users":{
                    "post":{
                       "operationId":"UsersController_create",
                       "summary":"Creates a new user",
                       "parameters":[ ],
                       "requestBody":{
                          "required":true,
                          "content":{
                             "application/json":{
                                "schema":{
                                   "$ref":"#/components/schemas/UserCreateRequest"
                                }
                             }
                          }
                       },
                       "responses":{
                          "201":{ "description":"user created" },
                          "400":{ "description":"name, email and password are required" }
                       },
                       "tags":[ "users" ],
                       "security":[
                          { "bearer":[ ] }
                       ]
                    }
                },
                "/api/users/{id}":{
                    "parameters":[
                        {
                            "name":"filtered",
                            "required":false,
                            "in":"query",
                            "schema":{
                               "type":"boolean"
                            }
                        }
                    ],
                    "patch":{
                       "operationId":"UsersController_patch",
                       "summary":"Enable or disable/verify or unverify an user",
                       "parameters":[
                          {
                             "name":"id",
                             "required":true,
                             "in":"path",
                             "schema":{
                                "type":"string"
                             }
                          }
                       ],
                       "requestBody":{
                           "required":true,
                           "content":{
                              "application/json":{
                                  "schema":{
                                      "$ref":"#/components/schemas/UserUpdateRequest"
                                    }
                                },
                                "application/xml":{
                                    "schema":{
                                        "$ref":"#/components/schemas/UserUpdateRequest"
                                    }
                                },
                                "multipart/form-data": {
                                    "schema": {
                                        "properties": {
                                            "file": {
                                              "type": "array",
                                              "items": {
                                                  "type": "string",
                                                  "format": "binary"
                                                }
                                            },
                                            "verified": {
                                                "type": "boolean",
                                                "example": "set the user as verified/unverified"
                                            },
                                            "enabled": {
                                                "type": "string",
                                                "example": "set the user as enabled/disabled"
                                            },
                                            "name": {
                                                "type": "string",
                                                "example": "email@domain.net"
                                            }
                                        }
                                    }
                                }
                            }
                       },
                       "responses":{
                          "201":{
                             "description":"user updated"
                          },
                          "400":{
                             "description":"id and at least one field are required"
                          }
                       },
                       "tags":[ "users" ],
                       "security":[
                          { "bearer":[ ] }
                       ]
                    },
                    "get":{
                        "operationId":"UsersController_me",
                        "summary":"Gets the current logged user",
                        "parameters":[
                            {
                               "name":"id",
                               "required":true,
                               "in":"path",
                               "schema":{
                                  "type":"string"
                               }
                            },
                            {
                                "name":"sort",
                                "required":false,
                                "in":"query",
                                "schema":{
                                   "type":"boolean"
                                }
                            }
                         ],
                        "responses":{
                           "200":{
                              "description":"The current logged in user",
                              "content":{
                                 "application/json":{
                                    "schema":{
                                       "$ref":"#/components/schemas/User"
                                    }
                                 }
                              }
                           }
                        },
                        "tags":[
                           "users"
                        ],
                        "security":[
                           { "bearer":[ ] }
                        ]
                     }
                 },
            },
            info: {},
            tags: [{ name: "auth" }],
            servers: [ { url: "http://test.domain.com" }],
            components: {
                securitySchemes: {
                    bearer: {
                        scheme: "bearer",
                        bearerFormat: "JWT",
                        type: "http"
                    }
                },
                schemas: {
                    LoginRequest: {
                        type: "object",
                        properties: {
                            email: { type: "string" },
                            password: { type: "string" },
                        },
                        required: ["email","password"]
                    },
                    User: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            email: { type: "string" },
                            allowed: { type: "boolean" }
                        },
                        required: ["name", "email"]
                    },
                    LoginResponse:{
                        type:"object",
                        properties:{
                           message: {
                              "type":"string"
                           },
                           access_token:{
                              "type":"string"
                           },
                           user:{
                              "$ref":"#/components/schemas/User"
                           }
                        },
                        required:[ "message", "access_token", "user" ]
                    },
                    UserCreateRequest:{
                        type:"object",
                        properties:{
                           name:{
                              "type":"string"
                           },
                           email:{
                              type:"string"
                           },
                           password:{
                              type:"string"
                           }
                        },
                        required:[ "name", "email", "password" ]
                    },
                    UserUpdateRequest: {
                        type:"object",
                        properties:{
                           verified:{
                              type:"boolean"
                           },
                           enabled:{
                              type:"boolean"
                           }
                        },
                        required: [ "verified", "enabled" ]
                    }
                }
            }
        } as any as OpenAPIObject;
    });

    it('Should get har for login post', () => {
        const expected = [
            {
              method: 'POST',
              pathname: '/api/auth/login',
              url: 'http://test.domain.com/api/auth/login',
              headers: [ { name: 'content-type', value: 'application/json' } ],
              queryString: [],
              httpVersion: 'HTTP/1.1',
              cookies: [],
              headersSize: 0,
              bodySize: 0,
              postData: {
                mimeType: 'application/json',
                text: '{"email":"string","password":"string"}'
              },
              comment: 'application/json'
            }
        ]

        const har = new ApiToHar(openApi);
        expect(har.getPath('/api/auth/login').post.toArray()).toEqual(expected);
    });

    it('Should get har for user post', () => {
    
        const expected = [
            {
                method: 'POST',
                pathname: '/api/users',
                url: 'http://test.domain.com/api/users',
                headers: [
                    { name: 'Authorization', value: 'Bearer REPLACE_BEARER_TOKEN' },
                    { name: 'content-type', value: 'application/json' }
                ],
                queryString: [],
                httpVersion: 'HTTP/1.1',
                cookies: [],
                headersSize: 0,
                bodySize: 0,
                postData: {
                  mimeType: 'application/json',
                  text: '{"name":"string","email":"string","password":"string"}'
                },
                comment: 'application/json'
            }
        ]

        const har = new ApiToHar(openApi);
        expect(har.getPath('/api/users').post.toArray()).toEqual(expected);
    });

    it('Should get har for user path', () => {
        const expected = [
            {
                method: 'PATCH',
                pathname: '/api/users/{id}',
                url: 'http://test.domain.com/api/users/{id}',
                headers: [
                    { name: 'Authorization', value: 'Bearer REPLACE_BEARER_TOKEN' },
                    { name: 'content-type', value: 'application/json' }
                ],
                queryString: [{
                    name: 'filtered',
                    value: 'SOME_BOOLEAN_VALUE',
                }],
                httpVersion: 'HTTP/1.1',
                cookies: [],
                headersSize: 0,
                bodySize: 0,
                postData: {
                  mimeType: 'application/json',
                  text: '{"verified":true,"enabled":true}'
                },
                comment: 'application/json'
            },
            {
                method: 'PATCH',
                pathname: '/api/users/{id}',
                url: 'http://test.domain.com/api/users/{id}',
                headers: [
                    { name: 'Authorization', value: 'Bearer REPLACE_BEARER_TOKEN' },
                    { name: 'content-type', value: 'application/xml' }
                ],
                queryString: [{
                    name: 'filtered',
                    value: 'SOME_BOOLEAN_VALUE',
                }],
                httpVersion: 'HTTP/1.1',
                cookies: [],
                headersSize: 0,
                bodySize: 0,
                postData: {
                  mimeType: 'application/xml',
                  text: '{"verified":true,"enabled":true}'
                },
                comment: 'application/xml'
            },
            {
                method: 'PATCH',
                pathname: '/api/users/{id}',
                url: 'http://test.domain.com/api/users/{id}',
                headers: [
                    { name: 'Authorization', value: 'Bearer REPLACE_BEARER_TOKEN' },
                    { name: 'content-type', value: 'multipart/form-data' }
                ],
                queryString: [{
                    name: 'filtered',
                    value: 'SOME_BOOLEAN_VALUE',
                }],
                httpVersion: 'HTTP/1.1',
                cookies: [],
                headersSize: 0,
                bodySize: 0,
                postData: { mimeType: 'multipart/form-data',
                    params: [
                        {
                            "name": "file",
                            "value": "[\"string\"]"
                        },
                        {
                            "name": "verified",
                            "value": "set the user as verified/unverified"
                        },
                        {
                            "name": "enabled",
                            "value": "set the user as enabled/disabled"
                        },
                        {
                            "name": "name",
                            "value": "email@domain.net"
                        }
                    ]
                },
                comment: 'multipart/form-data'
            }
        ]

        const har = new ApiToHar(openApi);
        expect(har.getPath('/api/users/{id}').patch.toArray()).toEqual(expected);
    });

    it('Should get har for user get', () => {
        const expected = [
            {
                method: 'GET',
                pathname: '/api/users/{id}',
                url: 'http://test.domain.com/api/users/{id}',
                headers: [ { name: 'Authorization', value: 'Bearer REPLACE_BEARER_TOKEN' } ],
                queryString: [{
                    name: "sort",
                    value: 'SOME_BOOLEAN_VALUE',
                },{
                    name: 'filtered',
                    value: "SOME_BOOLEAN_VALUE"
                }],
                httpVersion: 'HTTP/1.1',
                cookies: [],
                headersSize: 0,
                bodySize: 0,
                comment: ''
            }
        ]

        const har = new ApiToHar(openApi);
        expect(har.getPath('/api/users/{id}').get.toArray()).toEqual(expected);
    });

    it('Should get all hars', () => {

        const expected = [
            {
              method: 'POST',
              pathname: '/api/auth/login',
              url: 'http://test.domain.com/api/auth/login',
              description: 'No description available',
              hars: [
                {
                  method: 'POST',
                  pathname: '/api/auth/login',
                  url: 'http://test.domain.com/api/auth/login',
                  headers: [ { name: 'content-type', value: 'application/json' } ],
                  queryString: [],
                  httpVersion: 'HTTP/1.1',
                  cookies: [],
                  headersSize: 0,
                  bodySize: 0,
                  postData: {
                    mimeType: 'application/json',
                    text: '{"email":"string","password":"string"}'
                  },
                  comment: 'application/json'
                }
            ]
            },
            {
              method: 'POST',
              pathname: '/api/users',
              url: 'http://test.domain.com/api/users',
              description: 'No description available',
              hars: [
                {
                    method: 'POST',
                    pathname: '/api/users',
                    url: 'http://test.domain.com/api/users',
                    headers: [
                        { name: 'Authorization', value: 'Bearer REPLACE_BEARER_TOKEN' },
                        { name: 'content-type', value: 'application/json' }
                    ],
                    queryString: [],
                    httpVersion: 'HTTP/1.1',
                    cookies: [],
                    headersSize: 0,
                    bodySize: 0,
                    postData: {
                      mimeType: 'application/json',
                      text: '{"name":"string","email":"string","password":"string"}'
                    },
                    comment: 'application/json'
                }
            ]
            },
            {
              method: 'PATCH',
              pathname: '/api/users/{id}',
              url: 'http://test.domain.com/api/users/{id}',
              description: 'No description available',
              hars: [
                {
                    method: 'PATCH',
                    pathname: '/api/users/{id}',
                    url: 'http://test.domain.com/api/users/{id}',
                    headers: [
                        { name: 'Authorization', value: 'Bearer REPLACE_BEARER_TOKEN' },
                        { name: 'content-type', value: 'application/json' }
                    ],
                    queryString: [{
                        name: 'filtered',
                        value: 'SOME_BOOLEAN_VALUE'
                    }],
                    httpVersion: 'HTTP/1.1',
                    cookies: [],
                    headersSize: 0,
                    bodySize: 0,
                    postData: {
                      mimeType: 'application/json',
                      text: '{"verified":true,"enabled":true}'
                    },
                    comment: 'application/json'
                },
                {
                    method: 'PATCH',
                    pathname: '/api/users/{id}',
                    url: 'http://test.domain.com/api/users/{id}',
                    headers: [
                        { name: 'Authorization', value: 'Bearer REPLACE_BEARER_TOKEN' },
                        { name: 'content-type', value: 'application/xml' }
                    ],
                    queryString: [{
                        name: 'filtered',
                        value: 'SOME_BOOLEAN_VALUE'
                    }],
                    httpVersion: 'HTTP/1.1',
                    cookies: [],
                    headersSize: 0,
                    bodySize: 0,
                    postData: {
                        mimeType: 'application/xml',
                        text: '{"verified":true,"enabled":true}'
                    },
                    comment: 'application/xml'
                },
                {
                    method: 'PATCH',
                    pathname: '/api/users/{id}',
                    url: 'http://test.domain.com/api/users/{id}',
                    headers: [
                        { name: 'Authorization', value: 'Bearer REPLACE_BEARER_TOKEN' },
                        { name: 'content-type', value: 'multipart/form-data' }
                    ],
                    queryString: [{
                        name: 'filtered',
                        value: 'SOME_BOOLEAN_VALUE'
                    }],
                    httpVersion: 'HTTP/1.1',
                    cookies: [],
                    headersSize: 0,
                    bodySize: 0,
                    postData: {
                        mimeType: 'multipart/form-data',
                        params: [
                            {
                                "name": "file",
                                "value": "[\"string\"]"
                            },
                            {
                                "name": "verified",
                                "value": "set the user as verified/unverified"
                            },
                            {
                                "name": "enabled",
                                "value": "set the user as enabled/disabled"
                            },
                            {
                                "name": "name",
                                "value": "email@domain.net"
                            }
                        ]
                    },
                    comment: 'multipart/form-data'
                }
            ]
            },
            {
              method: 'GET',
              pathname: '/api/users/{id}',
              url: 'http://test.domain.com/api/users/{id}',
              description: 'No description available',
              hars: [
                {
                    method: 'GET',
                    pathname: '/api/users/{id}',
                    url: 'http://test.domain.com/api/users/{id}',
                    headers: [ { name: 'Authorization', value: 'Bearer REPLACE_BEARER_TOKEN' } ],
                    queryString: [{
                        name: 'sort',
                        value: 'SOME_BOOLEAN_VALUE',
                    },{
                        name: 'filtered',
                        value: "SOME_BOOLEAN_VALUE"
                    }],
                    httpVersion: 'HTTP/1.1',
                    cookies: [],
                    headersSize: 0,
                    bodySize: 0,
                    comment: ''
                }
            ]
            }
        ];

        const har = new ApiToHar(openApi);
        expect(har.toArray()).toEqual(expected);
    });


    describe('HarMethod', () => {

        describe('headers', () => {
            it('it should add bearer from method', () => {
                openApi.components.securitySchemes['basic'] = { 'type': 'http', 'scheme': 'basic' };
                openApi.paths['/api/users/{id}'].get.security = [ {'basic': [] }];
                const method = new ApiToHar(openApi).getPath('/api/users/{id}').get;
                expect(method.headers).toEqual([{
                    name: 'Authorization',
                    value: 'Basic REPLACE_BASIC_AUTH'
                  }]);
            });

            it('it should not add security item if not in header', () => {
                openApi.components.securitySchemes['apikey'] = { 'type': 'apiKey', 'name': 'test' };
                openApi.security = [ { 'apikey': [] }]
                openApi.paths['/api/users/{id}'].get.security = [];
                const method = new ApiToHar(openApi).getPath('/api/users/{id}').get;
                expect(method.headers).toEqual([]);
            });

            it('it should add item in header from get', () => {
                openApi.components.securitySchemes['apikey'] = { 'type': 'apiKey', 'name': 'test' };
                openApi.security = [ { 'apikey': [] }]
                openApi.paths['/api/users/{id}'].get.security = [];
                openApi.paths['/api/users/{id}'].get.parameters.push({
                    "name":"authorization",
                    "required":true,
                    "in":"header",
                    "schema":{
                       "type":"string"
                    }
                });
                const method = new ApiToHar(openApi).getPath('/api/users/{id}').get;
                expect(method.headers).toEqual([{
                    name: 'authorization',
                    value: "SOME_STRING_VALUE"
                }]);
            });

            it('it should add item in header from path and get', () => {
                openApi.components.securitySchemes['apikey'] = { 'type': 'apiKey', 'name': 'test' };
                openApi.security = [ { 'apikey': [] }]
                openApi.paths['/api/users/{id}'].get.security = [];
                openApi.paths['/api/users/{id}'].parameters.push({
                    "name":"authorization",
                    "required":true,
                    "in":"header",
                    "schema":{
                       "type":"boolean"
                    }
                });
                openApi.paths['/api/users/{id}'].parameters.push({
                    "name":"authorization2",
                    "required":true,
                    "in":"header",
                    "schema":{
                       "type":"string"
                    }
                });
                openApi.paths['/api/users/{id}'].get.parameters.push({
                    "name":"authorization",
                    "required":true,
                    "in":"header",
                    "schema":{
                       "type":"string"
                    }
                });
                const method = new ApiToHar(openApi).getPath('/api/users/{id}').get;
                expect(method.headers).toEqual([{
                    name: 'authorization',
                    value: "SOME_STRING_VALUE"
                },{
                    name: 'authorization2',
                    value: "SOME_STRING_VALUE"
                }]);
            });

            describe('method has empty or undefined security', () => {
    
                beforeEach(() => {
                    openApi.components.securitySchemes['apikey'] = { 'type': 'apiKey', 'name': 'test' };
                    openApi.security = [ { 'apikey': [] }]
                });
    
                it('should return apikey from root', () => {
                    openApi.paths['/api/users/{id}'].get.security = undefined;
                    const method = new ApiToHar(openApi).getPath('/api/users/{id}').get;
                    expect(method.headers).toEqual([]);
                });
        
                it('should return from root if method as empty security', () => {
                    openApi.paths['/api/users/{id}'].get.security = [];
                    const method = new ApiToHar(openApi).getPath('/api/users/{id}').get;
                    expect(method.headers).toEqual([]);
                });
            });
        });

        describe('query parameters', () => {
            it('it should define query string', () => {
                openApi.paths['/api/users/{id}'].parameters.push({
                    "name":"order",
                    "required":true,
                    "in":"query",
                    "schema":{
                       "type":"string"
                    }
                });

                openApi.paths['/api/users/{id}'].parameters.push({
                    "name":"filtered",
                    "required":true,
                    "in":"query",
                    "schema":{
                       "type":"string"
                    }
                });

                openApi.paths['/api/users/{id}'].parameters.push({
                    "name": "petId",
                    "in": "query",
                    "description": "ID of pet to use",
                    "required": true,
                    "schema": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                    },
                    "style": "simple"
                });

                const method = new ApiToHar(openApi).getPath('/api/users/{id}').get;
                expect(method.queryString).toEqual([{
                    name: 'sort',
                    value: "SOME_BOOLEAN_VALUE"
                },{
                    name: 'filtered',
                    value: 'SOME_BOOLEAN_VALUE',
                },{
                    name: 'order',
                    value: 'SOME_STRING_VALUE',
                },{
                    name: 'petId',
                    value: 'SOME_ARRAY_VALUE',
                }]);
            });
        });

        describe('post parameters', () => {
            it('it should define postdata', () => {
                openApi.paths['/api/users/{id}'].patch.requestBody['content']['application/x-www-form-urlencoded'] = {
                    "schema": {
                        "properties": {
                            "file": {
                              "type": "array",
                              "items": {
                                  "type": "string",
                                  "format": "binary"
                                }
                            },
                            "verified": {
                                "type": "boolean",
                                "example": "set the user as verified/unverified"
                            },
                            "enabled": {
                                "type": "string",
                                "example": "set the user as enabled/disabled"
                            },
                            "name": {
                                "type": "string",
                                "example": "email@domain.net"
                            }
                        }
                    }
                };

                const method = new ApiToHar(openApi).getPath('/api/users/{id}').patch;
                expect(method.postData.toArray()).toEqual([{
                    mimeType: 'application/json',
                    text: '{"verified":true,"enabled":true}'
                  },{
                    mimeType: 'application/xml',
                    text: '{"verified":true,"enabled":true}'
                  },{
                    mimeType: 'multipart/form-data',
                    params: [
                      { name: 'file', value: '["string"]' },
                      { name: 'verified', value: 'set the user as verified/unverified' },
                      { name: 'enabled', value: 'set the user as enabled/disabled' },
                      { name: 'name', value: 'email@domain.net' }
                    ]
                  },{
                    mimeType: 'application/x-www-form-urlencoded',
                    params: [
                      { name: 'file', value: 'string' },
                      { name: 'verified', value: 'set+the+user+as+verified%2Funverified' },
                      { name: 'enabled', value: 'set+the+user+as+enabled%2Fdisabled' },
                      { name: 'name', value: 'email%40domain.net' }
                    ],
                    text: 'file=string&verified=set+the+user+as+verified%2Funverified&enabled=set+the+user+as+enabled%2Fdisabled&name=email%40domain.net'
                  }]);
            });
        });
    });

});
