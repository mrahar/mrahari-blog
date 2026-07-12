import { QuartzComponentProps } from '@quartz-community/types';
export { QuartzComponent, QuartzComponentProps, StringResource } from '@quartz-community/types';
import * as preact from 'preact';
import { JSX } from 'preact';

interface ContentMetaOptions {
    /** Show the growth-state badge (🌦️/🌧️/🌈) */
    showStatus: boolean;
    /** Show the word count (📄) */
    showWordCount: boolean;
    /** Show planted (created) and watered (modified) dates */
    showDates: boolean;
}
declare const _default$1: (opts?: Partial<ContentMetaOptions>) => {
    ({ fileData, displayClass }: QuartzComponentProps): JSX.Element | null;
    css: string;
};

declare const _default: () => {
    ({ fileData, allFiles }: QuartzComponentProps): preact.JSX.Element | null;
    css: string;
};

export { _default as ArchiveList, _default$1 as ContentMeta, type ContentMetaOptions };
