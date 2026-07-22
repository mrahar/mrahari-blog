import { QuartzComponent } from '@quartz-community/types';

interface D3Config {
    drag: boolean;
    zoom: boolean;
    depth: number;
    scale: number;
    repelForce: number;
    centerForce: number;
    linkDistance: number;
    fontSize: number;
    opacityScale: number;
    removeTags: string[];
    showTags: boolean;
    focusOnHover?: boolean;
    enableRadial?: boolean;
}
interface GraphOptions {
    localGraph?: Partial<D3Config>;
    globalGraph?: Partial<D3Config>;
}
declare const _default: (userOpts?: Partial<GraphOptions>) => QuartzComponent;

export { _default as GraphFa };
