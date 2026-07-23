import type {
  QuartzComponentConstructor,
  QuartzComponentProps,
  FullSlug,
} from "@quartz-community/types";
import { resolveRelative } from "@quartz-community/utils/path";
import type { JSX } from "preact";
import style from "./styles/contentMeta.scss";

// Link targets for the clickable badges (must match the archive/philosophy slugs).
const SLUG_STATUS = "growth-status" as FullSlug;
const SLUG_PLANTED = "by-planting" as FullSlug;
const SLUG_WATERED = "by-watering" as FullSlug;

export interface ContentMetaOptions {
  /** Show the growth-state badge (🌦️/🌧️/🌈) */
  showStatus: boolean;
  /** Show the word count (📄) */
  showWordCount: boolean;
  /** Show planted (created) and watered (modified) dates */
  showDates: boolean;
}

const defaultOptions: ContentMetaOptions = {
  showStatus: true,
  showWordCount: true,
  showDates: true,
};

interface GrowthState {
  emoji: string;
  label: string;
}

// Baran-brand growth cycle: the "sky" side of the meta line.
const SEEDLING: GrowthState = { emoji: "🌱", label: "نوپا" };
const BUDDING: GrowthState = { emoji: "🌿", label: "در حال رشد" };
const EVERGREEN: GrowthState = { emoji: "🌳", label: "بالغ" };

const GROWTH_STATES: Record<string, GrowthState> = {
  seedling: SEEDLING,
  budding: BUDDING,
  evergreen: EVERGREEN,
};

// Aliases so the frontmatter can be written in Persian or plain English.
const GROWTH_ALIASES: Record<string, string> = {
  seed: "seedling",
  sprout: "seedling",
  growing: "budding",
  mature: "evergreen",
  "نوپا": "seedling",
  "در حال رشد": "budding",
  "درحال رشد": "budding",
  "بالغ": "evergreen",
};

function resolveGrowth(raw: unknown): GrowthState {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();
    if (GROWTH_STATES[lower]) {
      return GROWTH_STATES[lower];
    }
    const canonical = GROWTH_ALIASES[trimmed] ?? GROWTH_ALIASES[lower];
    if (canonical && GROWTH_STATES[canonical]) {
      return GROWTH_STATES[canonical];
    }
  }
  // Default for un-annotated notes: freshly planted.
  return SEEDLING;
}

function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

function toFaDigits(n: number): string {
  return n.toLocaleString("fa-IR");
}

function formatFa(date: Date): string {
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  const options: ContentMetaOptions = { ...defaultOptions, ...opts };

  function ContentMetadata({ fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text;
    if (!text) {
      return null;
    }

    const here = (fileData.slug ?? "") as FullSlug;
    const segments: JSX.Element[] = [];

    // Growth-state badge (frontmatter: growth / status) — links to the philosophy page
    if (options.showStatus) {
      const fm = fileData.frontmatter as Record<string, unknown> | undefined;
      const growth = resolveGrowth(fm?.growth ?? fm?.status);
      segments.push(
        <a
          class="cm-item cm-status"
          href={resolveRelative(here, SLUG_STATUS)}
          data-tip={`وضعیت رشد: ${growth.label} — فلسفه‌اش`}
          aria-label={`وضعیت رشد: ${growth.label}`}
        >
          <span class="cm-emoji" aria-hidden="true">
            {growth.emoji}
          </span>
          <span class="cm-text">{growth.label}</span>
        </a>,
      );
    }

    // Word count
    if (options.showWordCount) {
      const words = countWords(text as string);
      segments.push(
        <span
          class="cm-item cm-words"
          data-tip="تعداد کلمات این نوشته"
          aria-label="تعداد کلمات این نوشته"
        >
          <span class="cm-emoji" aria-hidden="true">
            📄
          </span>
          <span class="cm-text">{toFaDigits(words)} کلمه</span>
        </span>,
      );
    }

    // Planted (created) and watered (modified) dates
    if (options.showDates && fileData.dates) {
      const created = fileData.dates.created;
      const modified = fileData.dates.modified;

      if (created) {
        segments.push(
          <a
            class="cm-item cm-planted"
            href={resolveRelative(here, SLUG_PLANTED)}
            data-tip="تاریخِ کاشت (اولین انتشار) — همه بر اساس انتشار"
            aria-label="تاریخِ کاشت (اولین انتشار)"
          >
            <span class="cm-emoji" aria-hidden="true">
              🌱
            </span>
            <time datetime={created.toISOString()} class="cm-text">
              {formatFa(created)}
            </time>
          </a>,
        );
      }

      if (modified) {
        segments.push(
          <a
            class="cm-item cm-watered"
            href={resolveRelative(here, SLUG_WATERED)}
            data-tip="آخرین آبیاری (به‌روزرسانی) — همه بر اساس آخرین تغییر"
            aria-label="آخرین آبیاری (به‌روزرسانی)"
          >
            <span class="cm-emoji" aria-hidden="true">
              💧
            </span>
            <time datetime={modified.toISOString()} class="cm-text">
              {formatFa(modified)}
            </time>
          </a>,
        );
      }
    }

    if (segments.length === 0) {
      return null;
    }

    // Interleave a standalone dot separator so it is NOT inside any badge's box.
    const withSeparators: JSX.Element[] = [];
    segments.forEach((seg, i) => {
      if (i > 0) {
        withSeparators.push(
          <span class="cm-sep" aria-hidden="true">
            ·
          </span>,
        );
      }
      withSeparators.push(seg);
    });

    return (
      <p class={["content-meta", displayClass].filter(Boolean).join(" ")}>{withSeparators}</p>
    );
  }

  ContentMetadata.css = style;

  return ContentMetadata;
}) satisfies QuartzComponentConstructor;
