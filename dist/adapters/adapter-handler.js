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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterHandler = exports.NotImplementedError = void 0;
const path_1 = __importDefault(require("path"));
const redocly_try_it_out_1 = require("redocly-try-it-out");
const render_util_1 = require("../utils/render.util");
const fs_1 = require("fs");
class NotImplementedError extends Error {
}
exports.NotImplementedError = NotImplementedError;
class AdapterHandler {
    get httpAdapter() {
        return AdapterHandler.httpAdapter;
    }
    get path() {
        return AdapterHandler.path;
    }
    get document() {
        return AdapterHandler.document;
    }
    get options() {
        return AdapterHandler.options;
    }
    get docUrl() {
        var _a;
        return [this.path, `${((_a = this.options) === null || _a === void 0 ? void 0 : _a.docName) || "swagger"}.json`].join("/");
    }
    get isExpectedAdapter() {
        return (this.httpAdapter &&
            this.httpAdapter.constructor &&
            this.httpAdapter.constructor.name === this.adapterName);
    }
    setNextHandler(handler) {
        this.nextHandler = handler;
        return handler;
    }
    handle() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isExpectedAdapter) {
                yield this.setup();
                return;
            }
            return (_a = this.nextHandler) === null || _a === void 0 ? void 0 : _a.handle();
        });
    }
    static init(adapter, path, document, options) {
        AdapterHandler.httpAdapter = adapter;
        AdapterHandler.path = path;
        AdapterHandler.document = document;
        AdapterHandler.options = options;
        const expressHandler = new ExpressAdapterHandler();
        const fastifyHandler = new FastifyAdapterHandler();
        expressHandler.setNextHandler(fastifyHandler);
        return expressHandler;
    }
}
exports.AdapterHandler = AdapterHandler;
class ExpressAdapterHandler extends AdapterHandler {
    get adapterName() {
        return "ExpressAdapter";
    }
    setupRedocHtml() {
        return __awaiter(this, void 0, void 0, function* () {
            const { path, docUrl, options, document } = this;
            const redocHTML = yield (0, render_util_1.renderRedocView)({
                path,
                tryItOutJsMinFileName: redocly_try_it_out_1.tryItOutJsMinFileName,
                docUrl,
                options: options || {},
                document,
            });
            this.httpAdapter.get(this.path, (req, res) => __awaiter(this, void 0, void 0, function* () { return res.send(redocHTML); }));
        });
    }
    setupDocUrl() {
        this.httpAdapter.get(this.docUrl, (req, res) => {
            res.setHeader("Content-Type", "application/json");
            res.send(this.document);
        });
    }
    setupJS() {
        const pathToModule = require.resolve("redocly-try-it-out");
        const filePath = path_1.default.join(path_1.default.dirname(pathToModule), redocly_try_it_out_1.tryItOutJsMinFileName);
        const fileContent = (0, fs_1.readFileSync)(filePath, "utf-8");
        this.httpAdapter.get(`${this.path}/${redocly_try_it_out_1.tryItOutJsMinFileName}`, (req, res) => {
            res.type("application/javascript");
            res.send(fileContent);
        });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setupRedocHtml();
            this.setupDocUrl();
            this.setupJS();
        });
    }
}
class FastifyAdapterHandler extends AdapterHandler {
    get adapterName() {
        return "FastifyAdapter";
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new NotImplementedError("Fastify is not implemented yet");
        });
    }
}
