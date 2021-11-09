import { OpenAPIObject } from '@nestjs/swagger';
import { getEndpointSnippets, getSnippets } from './code-gen';

describe('Code gen', () => {
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


    it('getEndpointSnippets', () => {
       const expected = {
         method: 'PATCH',
         url: 'http://test.domain.com/api/users/{id}',
         description: 'No description available',
         resource: 'users',
         snippets: [
           {
             id: {
               title: 'JavaScript + XMLHttpRequest',
               language: 'javascript',
               library: 'xhr'
             },
             mimeType: 'application/json',
             title: 'JavaScript + XMLHttpRequest',
             content: 'const data = JSON.stringify({\n' +
               '  "verified": true,\n' +
               '  "enabled": true\n' +
               '});\n' +
               '\n' +
               'const xhr = new XMLHttpRequest();\n' +
               'xhr.withCredentials = true;\n' +
               '\n' +
               'xhr.addEventListener("readystatechange", function () {\n' +
               '  if (this.readyState === this.DONE) {\n' +
               '    console.log(this.responseText);\n' +
               '  }\n' +
               '});\n' +
               '\n' +
               'xhr.open("PATCH", "http://test.domain.com/api/users/%7Bid%7D?filtered=SOME_BOOLEAN_VALUE");\n' +
               'xhr.setRequestHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN");\n' +
               'xhr.setRequestHeader("content-type", "application/json");\n' +
               '\n' +
               'xhr.send(data);'
           },
           {
             id: {
               title: 'JavaScript + XMLHttpRequest',
               language: 'javascript',
               library: 'xhr'
             },
             mimeType: 'application/xml',
             title: 'JavaScript + XMLHttpRequest',
             content: 'const data = "{\\"verified\\":true,\\"enabled\\":true}";\n' +
               '\n' +
               'const xhr = new XMLHttpRequest();\n' +
               'xhr.withCredentials = true;\n' +
               '\n' +
               'xhr.addEventListener("readystatechange", function () {\n' +
               '  if (this.readyState === this.DONE) {\n' +
               '    console.log(this.responseText);\n' +
               '  }\n' +
               '});\n' +
               '\n' +
               'xhr.open("PATCH", "http://test.domain.com/api/users/%7Bid%7D?filtered=SOME_BOOLEAN_VALUE");\n' +
               'xhr.setRequestHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN");\n' +
               'xhr.setRequestHeader("content-type", "application/xml");\n' +
               '\n' +
               'xhr.send(data);'
           },
           {
             id: {
               title: 'JavaScript + XMLHttpRequest',
               language: 'javascript',
               library: 'xhr'
             },
             mimeType: 'multipart/form-data',
             title: 'JavaScript + XMLHttpRequest',
             content: 'const data = new FormData();\n' +
               'data.append("file", "[\\"string\\"]");\n' +
               'data.append("verified", "set the user as verified/unverified");\n' +
               'data.append("enabled", "set the user as enabled/disabled");\n' +
               'data.append("name", "email@domain.net");\n' +
               '\n' +
               'const xhr = new XMLHttpRequest();\n' +
               'xhr.withCredentials = true;\n' +
               '\n' +
               'xhr.addEventListener("readystatechange", function () {\n' +
               '  if (this.readyState === this.DONE) {\n' +
               '    console.log(this.responseText);\n' +
               '  }\n' +
               '});\n' +
               '\n' +
               'xhr.open("PATCH", "http://test.domain.com/api/users/%7Bid%7D?filtered=SOME_BOOLEAN_VALUE");\n' +
               'xhr.setRequestHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN");\n' +
               '\n' +
               'xhr.send(data);'
           }
         ]
       }
        const snippets = getEndpointSnippets(openApi, "/api/users/{id}", 'patch', ['javascript']);
        expect(snippets).toEqual(expected);
    })

    it('getSnippets', () => {
         const expected = [
            {
              method: 'POST',
              url: 'http://test.domain.com/api/auth/login',
              description: 'No description available',
              resource: 'login',
              snippets: [
               {
                 id: {
                   title: 'JavaScript + XMLHttpRequest',
                   language: 'javascript',
                   library: 'xhr'
                 },
                 mimeType: 'application/json',
                 title: 'JavaScript + XMLHttpRequest',
                 content: 'const data = JSON.stringify({\n' +
                   '  "email": "string",\n' +
                   '  "password": "string"\n' +
                   '});\n' +
                   '\n' +
                   'const xhr = new XMLHttpRequest();\n' +
                   'xhr.withCredentials = true;\n' +
                   '\n' +
                   'xhr.addEventListener("readystatechange", function () {\n' +
                   '  if (this.readyState === this.DONE) {\n' +
                   '    console.log(this.responseText);\n' +
                   '  }\n' +
                   '});\n' +
                   '\n' +
                   'xhr.open("POST", "http://test.domain.com/api/auth/login");\n' +
                   'xhr.setRequestHeader("content-type", "application/json");\n' +
                   '\n' +
                   'xhr.send(data);'
               }
             ]
            },
            {
               method: 'POST',
               url: 'http://test.domain.com/api/users',
               description: 'No description available',
               resource: 'users',
               snippets: [
                {
                  id: {
                    title: 'JavaScript + XMLHttpRequest',
                    language: 'javascript',
                    library: 'xhr'
                  },
                  mimeType: 'application/json',
                  title: 'JavaScript + XMLHttpRequest',
                  content: 'const data = JSON.stringify({\n' +
                    '  "name": "string",\n' +
                    '  "email": "string",\n' +
                    '  "password": "string"\n' +
                    '});\n' +
                    '\n' +
                    'const xhr = new XMLHttpRequest();\n' +
                    'xhr.withCredentials = true;\n' +
                    '\n' +
                    'xhr.addEventListener("readystatechange", function () {\n' +
                    '  if (this.readyState === this.DONE) {\n' +
                    '    console.log(this.responseText);\n' +
                    '  }\n' +
                    '});\n' +
                    '\n' +
                    'xhr.open("POST", "http://test.domain.com/api/users");\n' +
                    'xhr.setRequestHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN");\n' +
                    'xhr.setRequestHeader("content-type", "application/json");\n' +
                    '\n' +
                    'xhr.send(data);'
                }
              ]
             },
            {
              method: 'PATCH',
              url: 'http://test.domain.com/api/users/{id}',
              description: 'No description available',
              resource: 'users',
              snippets: [
               {
                 id: {
                   title: 'JavaScript + XMLHttpRequest',
                   language: 'javascript',
                   library: 'xhr'
                 },
                 mimeType: 'application/json',
                 title: 'JavaScript + XMLHttpRequest',
                 content: 'const data = JSON.stringify({\n' +
                   '  "verified": true,\n' +
                   '  "enabled": true\n' +
                   '});\n' +
                   '\n' +
                   'const xhr = new XMLHttpRequest();\n' +
                   'xhr.withCredentials = true;\n' +
                   '\n' +
                   'xhr.addEventListener("readystatechange", function () {\n' +
                   '  if (this.readyState === this.DONE) {\n' +
                   '    console.log(this.responseText);\n' +
                   '  }\n' +
                   '});\n' +
                   '\n' +
                   'xhr.open("PATCH", "http://test.domain.com/api/users/%7Bid%7D?filtered=SOME_BOOLEAN_VALUE");\n' +
                   'xhr.setRequestHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN");\n' +
                   'xhr.setRequestHeader("content-type", "application/json");\n' +
                   '\n' +
                   'xhr.send(data);'
               },
               {
                 id: {
                   title: 'JavaScript + XMLHttpRequest',
                   language: 'javascript',
                   library: 'xhr'
                 },
                 mimeType: 'application/xml',
                 title: 'JavaScript + XMLHttpRequest',
                 content: 'const data = "{\\"verified\\":true,\\"enabled\\":true}";\n' +
                   '\n' +
                   'const xhr = new XMLHttpRequest();\n' +
                   'xhr.withCredentials = true;\n' +
                   '\n' +
                   'xhr.addEventListener("readystatechange", function () {\n' +
                   '  if (this.readyState === this.DONE) {\n' +
                   '    console.log(this.responseText);\n' +
                   '  }\n' +
                   '});\n' +
                   '\n' +
                   'xhr.open("PATCH", "http://test.domain.com/api/users/%7Bid%7D?filtered=SOME_BOOLEAN_VALUE");\n' +
                   'xhr.setRequestHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN");\n' +
                   'xhr.setRequestHeader("content-type", "application/xml");\n' +
                   '\n' +
                   'xhr.send(data);'
               },
               {
                 id: {
                   title: 'JavaScript + XMLHttpRequest',
                   language: 'javascript',
                   library: 'xhr'
                 },
                 mimeType: 'multipart/form-data',
                 title: 'JavaScript + XMLHttpRequest',
                 content: 'const data = new FormData();\n' +
                   'data.append("file", "[\\"string\\"]");\n' +
                   'data.append("verified", "set the user as verified/unverified");\n' +
                   'data.append("enabled", "set the user as enabled/disabled");\n' +
                   'data.append("name", "email@domain.net");\n' +
                   '\n' +
                   'const xhr = new XMLHttpRequest();\n' +
                   'xhr.withCredentials = true;\n' +
                   '\n' +
                   'xhr.addEventListener("readystatechange", function () {\n' +
                   '  if (this.readyState === this.DONE) {\n' +
                   '    console.log(this.responseText);\n' +
                   '  }\n' +
                   '});\n' +
                   '\n' +
                   'xhr.open("PATCH", "http://test.domain.com/api/users/%7Bid%7D?filtered=SOME_BOOLEAN_VALUE");\n' +
                   'xhr.setRequestHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN");\n' +
                   '\n' +
                   'xhr.send(data);'
               }
             ]
            },
            {
              method: 'GET',
              url: 'http://test.domain.com/api/users/{id}',
              description: 'No description available',
              resource: 'users',
              snippets: [
               {
                 id: {
                   title: 'JavaScript + XMLHttpRequest',
                   language: 'javascript',
                   library: 'xhr'
                 },
                 title: 'JavaScript + XMLHttpRequest',
                 content: 'const data = null;\n' +
                   '\n' +
                   'const xhr = new XMLHttpRequest();\n' +
                   'xhr.withCredentials = true;\n' +
                   '\n' +
                   'xhr.addEventListener("readystatechange", function () {\n' +
                   '  if (this.readyState === this.DONE) {\n' +
                   '    console.log(this.responseText);\n' +
                   '  }\n' +
                   '});\n' +
                   '\n' +
                   'xhr.open("GET", "http://test.domain.com/api/users/%7Bid%7D?sort=SOME_BOOLEAN_VALUE&filtered=SOME_BOOLEAN_VALUE");\n' +
                   'xhr.setRequestHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN");\n' +
                   '\n' +
                   'xhr.send(data);'
               }
             ]
            }
          ]
         const snippets = getSnippets(openApi, ['javascript']);
         expect(snippets).toEqual(expected);
    });
});