import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  FullSlug,
} from "@quartz-community/types";
import { resolveRelative, simplifySlug } from "@quartz-community/utils/path";
import style from "./styles/backlinks.scss";

export interface BacklinksOptions {
  /** Heading of the widget. */
  title: string;
  /** Hide the whole widget when there are no incoming links. */
  hideWhenEmpty: boolean;
  /** Text shown when there are no incoming links (only if hideWhenEmpty is false). */
  emptyText: string;
}

const defaultOptions: BacklinksOptions = {
  title: "ارجاع‌ها به این نوشته",
  hideWhenEmpty: true,
  emptyText: "هنوز نوشته‌ای به این‌جا ارجاع نداده",
};

interface BacklinkCandidate {
  unlisted?: boolean;
  links?: string[];
  slug?: string;
  frontmatter?: { title?: string };
}

export function selectBacklinkSources(
  allFiles: BacklinkCandidate[],
  currentSlug: string,
): BacklinkCandidate[] {
  return allFiles.filter(
    (file) => file.unlisted !== true && file.links?.includes(currentSlug),
  );
}

export default ((opts?: Partial<BacklinksOptions>) => {
  const options: BacklinksOptions = { ...defaultOptions, ...opts };

  const Backlinks: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = simplifySlug(fileData.slug as FullSlug);
    const backlinks = selectBacklinkSources(allFiles as BacklinkCandidate[], slug);

    if (options.hideWhenEmpty && backlinks.length === 0) {
      return null;
    }

    return (
      <div class={`backlinks ${displayClass ?? ""}`}>
        <h3>{options.title}</h3>
        <ul class="backlinks-ul">
          {backlinks.length > 0 ? (
            backlinks.map((f) => (
              <li>
                <a
                  href={resolveRelative(fileData.slug as FullSlug, f.slug as FullSlug)}
                  class="internal"
                >
                  {f.frontmatter?.title ?? f.slug}
                </a>
              </li>
            ))
          ) : (
            <li class="backlinks-empty">{options.emptyText}</li>
          )}
        </ul>
      </div>
    );
  };

  Backlinks.css = style;
  return Backlinks;
}) satisfies QuartzComponentConstructor;
