import type {
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
  FullSlug,
} from "@quartz-community/types";
import { resolveRelative } from "@quartz-community/utils/path";
import style from "./styles/archiveList.scss";

type DateKey = "created" | "modified";

// Which archive a page is, detected from its slug (ZWNJ/hyphen tolerant).
function archiveKind(slug: string): DateKey | null {
  if (slug.includes("کاشت")) return "created";
  if (slug.includes("آبیاری")) return "modified";
  return null;
}

// Pages that must never appear inside an archive list.
function isSystemSlug(slug: string): boolean {
  if (!slug) return true;
  if (slug === "index" || slug.endsWith("/index")) return true;
  if (slug === "404") return true;
  if (slug === "tags" || slug.startsWith("tags/")) return true;
  if (slug.includes("کاشت") || slug.includes("آبیاری") || slug.includes("وضعیت-رشد")) return true;
  return false;
}

function formatFa(date: Date): string {
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default (() => {
  function ArchiveList({ fileData, allFiles }: QuartzComponentProps) {
    const currentSlug = (fileData.slug ?? "") as string;
    const kind = archiveKind(currentSlug);
    if (!kind) {
      // Not an archive page — render nothing on every other page.
      return null;
    }

    const pages = (allFiles as QuartzPluginData[])
      .filter((p) => {
        const slug = (p.slug ?? "") as string;
        if (isSystemSlug(slug)) return false;
        if ((p as { unlisted?: unknown }).unlisted === true) return false;
        return Boolean(p.dates?.[kind]);
      })
      .sort((a, b) => (b.dates![kind]!.getTime() ?? 0) - (a.dates![kind]!.getTime() ?? 0));

    if (pages.length === 0) {
      return null;
    }

    return (
      <div class={`archive-list archive-${kind}`}>
        <ul>
          {pages.map((p) => {
            const date = p.dates![kind]!;
            const title = p.frontmatter?.title ?? (p.slug as string);
            return (
              <li class="archive-row">
                <a
                  class="archive-title"
                  href={resolveRelative(currentSlug as FullSlug, p.slug as FullSlug)}
                >
                  {title}
                </a>
                <time class="archive-date" datetime={date.toISOString()}>
                  {formatFa(date)}
                </time>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  ArchiveList.css = style;

  return ArchiveList;
}) satisfies QuartzComponentConstructor;
