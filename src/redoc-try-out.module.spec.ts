import { HttpServer } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';
import { RedocTryOutModule } from './redoc-try-out.module';
import { AdapterHandler } from './adapters/adapter-handler';
import { RedocDocument } from './interfaces/redoc-document.interface';
import { RedocModuleOptions } from './interfaces/redoc-module-options.interface';
import { RedocDocumentModel } from './models/redoc-document.model'
import { RedocTryOutModuleError } from './errors/redoc-try-out-module.error';

describe('RedocTryOutModule', () => {
  it('should be truthy', () => {
    expect(RedocTryOutModule).toBeTruthy();
  });

  describe('Setup', () => {
    const httpServerFake:HttpServer = { type: 'HttpServerMock' } as any;
    const document: OpenAPIObject = { info: { title: 'title', 'version': '2' }, openapi: '',  paths: {} };
    const redoDocument: RedocDocument = { info: { title: 'title', 'version': '2' }, openapi: '',  paths: {},  'x-tagGroups': [] };
    const options: RedocModuleOptions = { skipSnippetsGeneration: false };

    let handlerSpy;
    let getHttpAdapterSpy;
    let app: any;

    beforeEach(() => {
      handlerSpy = jest.fn();
      getHttpAdapterSpy = jest.fn(() => httpServerFake);
      app = { getHttpAdapter: getHttpAdapterSpy };
      AdapterHandler.init = jest.fn(() => ({ handle: handlerSpy } as any));
      RedocDocumentModel.fromOpenApi = jest.fn(() => redoDocument);
    });

    describe('RedocDocument', () => {
      it('Should convert document to redocDocument', async () => {
        await RedocTryOutModule.setup('doc/api', app, document);
        expect(RedocDocumentModel.fromOpenApi).toBeCalledWith(document, undefined);
      });

      it('Should convert document to redocDocument using options', async () => {
        await RedocTryOutModule.setup('doc/api', app, document, options);
        expect(RedocDocumentModel.fromOpenApi).toBeCalledWith(document, options);
      });

      it('Should throw RedocTryOutModuleError', () => {
        RedocDocumentModel.fromOpenApi = jest.fn()
            .mockImplementation(() => { throw new Error(); });
        expect(() => RedocTryOutModule.setup('doc/api', app, document, options))
            .rejects
            .toThrow(RedocTryOutModuleError);

      });
    });

    describe('Initialize adapter handler', () => {
      describe('Path normalize', () => {
        const expectPathTest = async (path: string, expectedPath:string): Promise<void> => {
          await RedocTryOutModule.setup(path, app, document);
          expect(AdapterHandler.init).toBeCalledWith(expect.anything(), expectedPath, expect.anything(), undefined);
          await RedocTryOutModule.setup(path, app, document, options);
          expect(AdapterHandler.init).toBeCalledWith(expect.anything(), expectedPath, expect.anything(), expect.anything());
        }

        it('Should run the setup normalizing path with missing slash',  async () => {
          await expectPathTest('doc','/doc');
          await expectPathTest('doc/api','/doc/api');
        });

        it('Should run the setup normalizing path removing slash from the end',  async () => {
          await expectPathTest('/doc/','/doc');
          await expectPathTest('/doc/api/','/doc/api');
        });

        it('Should run the setup normalizing path',  async () => {
          await expectPathTest('doc/','/doc');
          await expectPathTest('doc/api/','/doc/api');
        });

        it('Should run the setup with given path',  async () => {
          await expectPathTest('/doc','/doc');
          await expectPathTest('/doc/api','/doc/api');
        });
      });

      describe('http server', () => {
        it ('Should run the setup with httpServer from app', async () => {
          await RedocTryOutModule.setup('/doc/api/', app, document);
          expect(AdapterHandler.init).toBeCalledWith(httpServerFake, expect.anything(), expect.anything(), undefined);
        });

        it ('should run the setup with httpServer from app with given options', async () => {
          await RedocTryOutModule.setup('/doc/api/', app, document, options);
          expect(AdapterHandler.init).toBeCalledWith(httpServerFake, expect.anything(), expect.anything(), options);
        });
      });

      describe('Redoc document', () => {
        it ('Should run the setup with redocDocument', async () => {
          await RedocTryOutModule.setup('/doc/api/', app, document);
          expect(AdapterHandler.init).toBeCalledWith(expect.anything(), expect.anything(), redoDocument, undefined);
        });

        it ('Should run the setup with redocDocument with given options', async () => {
          await RedocTryOutModule.setup('/doc/api/', app, document, options);
          expect(AdapterHandler.init).toBeCalledWith(expect.anything(), expect.anything(), redoDocument, options);
        });
      });

      describe('Handler', () => {
        it ('Should call adapter handler', async () => {
          await RedocTryOutModule.setup('/doc/api/', app, document);
          expect(handlerSpy).toHaveBeenCalled();
        });

        it ('Should call adapter handler even when options is provided', async () => {
          await RedocTryOutModule.setup('/doc/api/', app, document, options);
          expect(handlerSpy).toHaveBeenCalled();
        });
      });

      it('Should throw RedocTryOutModuleError', () => {
        AdapterHandler.init = jest.fn()
            .mockImplementation(() => { throw new Error(); });
        expect(() => RedocTryOutModule.setup('doc/api', app, document, options))
            .rejects
            .toThrow(RedocTryOutModuleError);

      });
    });
  });


  /*describe('weird error', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({}).compile();
      app = module.createNestApplication({
        initHttpServer: jest.fn(),
        getHttpServer: jest.fn(),
      } as any);
      const options = new DocumentBuilder()
        .setDescription('Test swagger Doc')
        .build();
      swagger = SwaggerModule.createDocument(app, options);
    });

    it('should throw an error for now', async () => {
      try {
        await RedocTryItModule.setup('some/path', app, swagger, {
          logo: { url: 'notaUrl' },
        });
      } catch (error) {
        // console.log(error);
        // expect(typeof error).toBe(TypeError);
        expect(error.message).toBe('"logo.url" must be a valid uri');
      }
    });
  });*/
});
