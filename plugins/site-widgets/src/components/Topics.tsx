import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  FullSlug,
} from "@quartz-community/types";
import { resolveRelative } from "@quartz-community/utils/path";
import style from "./styles/topics.scss";

export interface TopicItem {
  /** Text shown for the link. */
  title: string;
  /** Internal slug (e.g. "second-mind") or full external URL (starts with http). */
  href: string;
}

export interface TopicsOptions {
  /** Heading of the widget. */
  title: string;
  /** Curated links. Edit these in quartz.config.yaml under this plugin's `options.items`. */
  items: TopicItem[];
}

// Placeholder links — MR will finish this list later in quartz.config.yaml.
const defaultOptions: TopicsOptions = {
  title: "موضوعات اصلی",
  items: [
    { title: "ذهن دوم", href: "second-mind" },
    { title: "قیمت‌گذاری در دیجی‌کالا", href: "digikala-pricing" },
    { title: "وضعیت رشد نوشته‌ها", href: "growth-status" },
    { title: "درباره", href: "about" },
  ],
};

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export default ((opts?: Partial<TopicsOptions>) => {
  const options: TopicsOptions = { ...defaultOptions, ...opts };

  const Topics: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const items = options.items ?? [];
    if (items.length === 0) {
      return null;
    }
    const currentSlug = (fileData.slug ?? "") as FullSlug;

    return (
      <div class={`topics ${displayClass ?? ""}`}>
        <h3>{options.title}</h3>
        <ul class="topics-ul">
          {items.map((item) => {
            const external = isExternal(item.href);
            const href = external
              ? item.href
              : resolveRelative(currentSlug, item.href as FullSlug);
            return (
              <li>
                <a
                  href={href}
                  class={external ? "external" : "internal"}
                  {...(external ? { target: "_blank", rel: "noopener" } : {})}
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  Topics.css = style;
  return Topics;
}) satisfies QuartzComponentConstructor;
