"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = void 0;
const normalizePath = (inputPath) => (inputPath.charAt(0) !== '/' ? '/' + inputPath : inputPath).replace(/\/$/g, '');
exports.normalizePath = normalizePath;
