import type { RefObject } from 'react';

export type TargetValue<T> = T | undefined | null;

export type TargetType = HTMLElement | Element | Window | Document;

export type BasicTarget<T extends TargetType = Element> =
	| (() => TargetValue<T>)
	| TargetValue<T>
	| RefObject<T | null>;

export type Position = { left: number; top: number };
export type DomSize = { scrollHeight: number; scrollWidth: number; clientHeight: number; clientWidth: number };

export type Target = BasicTarget<Element | Document | Window>;
export type ScrollListenController = (params: Position) => boolean;