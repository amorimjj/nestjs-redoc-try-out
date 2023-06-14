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


class Teacher {
  constructor (public name: string, public age: number) { }
  
  toString() {
    return 'Teacher' + this.name + this.age;
  }
}

class PRT extends Teacher { 
  public name: string; public age: number; public subject: string;
  constructor(name: string, age: number, subject: string) {
    super(name, age);
    this.subject = subject;
  }

  toString(): string {
    return `PRT: ${this.name}, ${this.age}, ${this.subject}`;
  }
}

class TGT extends Teacher {
  constructor(public name: string, public age: number, public subject: string) {
    super(name, age);
  }
 }

class PGT extends Teacher { 
  constructor(public name: string, public age: number, public subject: string) {
    super(name, age);
  }
}