"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSnippetCode = void 0;
const normalizeSnippetCode = (code) => code.replace(/%7B/g, '{').replace(/%7D/g, '}');
exports.normalizeSnippetCode = normalizeSnippetCode;
