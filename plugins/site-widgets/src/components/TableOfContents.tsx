import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";
import style from "./styles/toc.scss";
// @ts-expect-error - inline script imported as string by esbuild loader
import script from "./scripts/toc.inline.ts";

export interface TocOptions {
  /** Heading of the box. */
  title: string;
  /** Start collapsed. */
  collapseByDefault: boolean;
}

const defaultOptions: TocOptions = {
  title: "فهرست مطالب",
  collapseByDefault: false,
};

interface TocEntry {
  slug: string;
  depth: number;
  text: string;
}

export default ((opts?: Partial<TocOptions>) => {
  const options: TocOptions = { ...defaultOptions, ...opts };

  const TableOfContents: QuartzComponent = ({
    fileData,
    displayClass,
  }: QuartzComponentProps) => {
    const toc = (fileData as { toc?: TocEntry[] }).toc;
    if (!toc || toc.length === 0) {
      return null;
    }
    const collapsed = options.collapseByDefault;

    return (
      <div class={`site-toc ${collapsed ? "collapsed" : ""} ${displayClass ?? ""}`}>
        <button
          type="button"
          class="site-toc-header"
          aria-expanded={collapsed ? "false" : "true"}
        >
          <svg
            class="site-toc-fold"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <h3>{options.title}</h3>
        </button>
        <ul class="site-toc-list">
          {toc.map((e) => (
            <li class={`depth-${e.depth}`}>
              <a href={`#${e.slug}`} data-for={e.slug}>
                {e.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  TableOfContents.css = style;
  TableOfContents.afterDOMLoaded = script;
  return TableOfContents;
}) satisfies QuartzComponentConstructor;
