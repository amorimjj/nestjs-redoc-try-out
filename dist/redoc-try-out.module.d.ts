import { INestApplication } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';
import { RedocModuleOptions } from './interfaces/redoc-module-options.interface';
export declare class RedocTryOutModule {
    static setup(path: string, app: INestApplication, document: OpenAPIObject, options?: RedocModuleOptions): Promise<void>;
}
