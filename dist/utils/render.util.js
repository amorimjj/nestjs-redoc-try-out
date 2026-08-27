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
exports.renderRedocView = void 0;
const path_1 = __importDefault(require("path"));
const express_handlebars_1 = __importDefault(require("express-handlebars"));
function renderRedocView(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const hbs = express_handlebars_1.default.create({ helpers: { toJson: (context) => JSON.stringify(context) } });
        const redocFilePath = path_1.default.join(__dirname, '..', 'views', 'view.handlebars');
        return yield hbs.render(redocFilePath, data);
    });
}
exports.renderRedocView = renderRedocView;
