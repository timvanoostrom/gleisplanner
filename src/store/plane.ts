import { writable } from 'svelte/store';
export const baseGroup = writable<SVGGElement>(null);
export const planeSvg = writable<SVGSVGElement>(null);
export const availableSpaceElement = writable<SVGRectElement>(null);
