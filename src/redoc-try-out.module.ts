import { INestApplication } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';
import { normalizePath } from './utils/normalize-path.util';
import { RedocModuleOptions} from './interfaces/redoc-module-options.interface';
import { AdapterHandler } from './adapters/adapter-handler';
import { RedocDocumentModel } from './models/redoc-document.model';
import { RedocTryOutModuleError } from './errors/redoc-try-out-module.error';

export class RedocTryOutModule {

  public static async setup(
    path: string,
    app: INestApplication,
    document: OpenAPIObject,
    options?: RedocModuleOptions
  ): Promise<void> {
    try {
      const redocDocument = RedocDocumentModel.fromOpenApi(document, options);
      await AdapterHandler
              .init(app.getHttpAdapter(), normalizePath(path), redocDocument, options)
              .handle();

    } catch (error) {
      throw new RedocTryOutModuleError(error);
    }
  }
}