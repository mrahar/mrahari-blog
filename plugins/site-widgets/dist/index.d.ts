import { QuartzComponent } from '@quartz-community/types';

interface TopicItem {
    /** Text shown for the link. */
    title: string;
    /** Internal slug (e.g. "second-mind") or full external URL (starts with http). */
    href: string;
}
interface TopicsOptions {
    /** Heading of the widget. */
    title: string;
    /** Curated links. Edit these in quartz.config.yaml under this plugin's `options.items`. */
    items: TopicItem[];
}
declare const _default$2: (opts?: Partial<TopicsOptions>) => QuartzComponent;

interface BacklinksOptions {
    /** Heading of the widget. */
    title: string;
    /** Hide the whole widget when there are no incoming links. */
    hideWhenEmpty: boolean;
    /** Text shown when there are no incoming links (only if hideWhenEmpty is false). */
    emptyText: string;
}
declare const _default$1: (opts?: Partial<BacklinksOptions>) => QuartzComponent;

interface TocOptions {
    /** Heading of the box. */
    title: string;
    /** Start collapsed. */
    collapseByDefault: boolean;
}
declare const _default: (opts?: Partial<TocOptions>) => QuartzComponent;

export { _default$1 as SiteBacklinks, _default as SiteToc, _default$2 as Topics };
