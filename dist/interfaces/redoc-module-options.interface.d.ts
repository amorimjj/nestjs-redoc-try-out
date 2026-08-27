import { RedocOptions } from "redocly-try-it-out";
import { Language } from "../code-snippet-gen/code-gen";
export interface RedocModuleOptions extends RedocOptions {
    title?: string;
    favicon?: string;
    docName?: string;
    skipSnippetsGeneration?: boolean;
    codeSnippetsLanguages?: Language[];
    auth?: {
        enabled: boolean;
        user: string;
        password: string;
    };
    tagGroups?: TagGroupOptions[];
    logo?: LogoOptions;
    customCss?: string;
}
export interface LogoOptions {
    url?: string;
    backgroundColor?: string;
    altText?: string;
    href?: string;
}
export interface TagGroupOptions {
    name: string;
    tags: string[];
}
