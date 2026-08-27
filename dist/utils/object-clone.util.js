"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = void 0;
function clone(object) { return JSON.parse(JSON.stringify(object)); }
exports.clone = clone;
