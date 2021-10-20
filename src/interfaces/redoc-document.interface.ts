import { OpenAPIObject } from '@nestjs/swagger';
import { LogoOptions, TagGroupOptions } from './redoc-module-options.interface';
import {InfoObject, OperationObject, PathItemObject} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export declare type RedocPathsObject = Record<string, RedocPathItemObject>;

interface RedocPathItemObject extends PathItemObject {
  get?: RedocOperationObject;
  put?: RedocOperationObject;
  post?: RedocOperationObject;
  delete?: RedocOperationObject;
  options?: RedocOperationObject;
  head?: RedocOperationObject;
  patch?: RedocOperationObject;
  trace?: RedocOperationObject;
}

export interface CodeSampleObject {
  lang: string;
  source: string;
}

interface RedocOperationObject extends OperationObject {
  'x-codeSamples': CodeSampleObject;
}

export interface RedocInfoObject extends InfoObject {
  'x-logo'?: LogoOptions;
}

export interface RedocDocument extends Partial<OpenAPIObject> {
  info: RedocInfoObject;
  'x-tagGroups': TagGroupOptions[];
  paths: RedocPathsObject
}
