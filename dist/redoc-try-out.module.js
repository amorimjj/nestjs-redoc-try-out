"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedocTryOutModule = void 0;
const normalize_path_util_1 = require("./utils/normalize-path.util");
const adapter_handler_1 = require("./adapters/adapter-handler");
const redoc_document_model_1 = require("./models/redoc-document.model");
const redoc_try_out_module_error_1 = require("./errors/redoc-try-out-module.error");
class RedocTryOutModule {
    static setup(path, app, document, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const redocDocument = redoc_document_model_1.RedocDocumentModel.fromOpenApi(document, options);
                yield adapter_handler_1.AdapterHandler
                    .init(app.getHttpAdapter(), (0, normalize_path_util_1.normalizePath)(path), redocDocument, options)
                    .handle();
            }
            catch (error) {
                throw new redoc_try_out_module_error_1.RedocTryOutModuleError(error);
            }
        });
    }
}
exports.RedocTryOutModule = RedocTryOutModule;
