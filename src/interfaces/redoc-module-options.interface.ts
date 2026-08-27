import { RedocOptions } from "redocly-try-it-out";
import { Language } from "../code-snippet-gen/code-gen";

export interface RedocModuleOptions extends RedocOptions {
  /**
   *  Web site title
   *  default: document.info.title || document.info.description || 'Online documentation'
   */
  title?: string;

  /** Web site favicon URL */
  favicon?: string;

  /** Name of the swagger json spec file. default: 'swagger' */
  docName?: string;

  /** Skip generation of code snippets: default: false */
  skipSnippetsGeneration?: boolean;

  /**
   *  Languages used on code generation snippets.
   *  default: ['javascript']
   */
  codeSnippetsLanguages?: Language[];

  /** Authentication options - not implemented yet */
  auth?: {
    enabled: boolean;
    user: string;
    password: string;
  };

  /**
   * Group tags in categories in the side menu.
   * Tags not added to a group will not be displayed.
   * default: document.tags
   */
  tagGroups?: TagGroupOptions[];

  /** Logo Options */
  logo?: LogoOptions;

  /** Custom CSS */
  customCss?: string;
}

export interface LogoOptions {
  /**
   * The URL pointing to the spec logo
   *  Format: Absolute URL
   */
  url?: string;

  /** Background color. Format: RGB color in hexadecimal format (e.g: #0000ff) */
  backgroundColor?: string;

  /** Alt tag for logo */
  altText?: string;

  /** href tag for logo. */
  href?: string;
}

export interface TagGroupOptions {
  name: string;
  tags: string[];
}
