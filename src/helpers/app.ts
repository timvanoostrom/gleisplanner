import { nanoid } from 'nanoid';
import { PROJECT_PREFIX } from '../config/constants';
import type { Point } from '../types';

export function range(a: number, b: number) {
  return Array.from(
    (function* (x, y) {
      while (x <= y) yield x++;
    })(a, b)
  );
}

export function downloadJSON(content: string, fileName: string) {
  var a = document.createElement('a');
  var file = new Blob([content], { type: 'application/json' });
  a.href = URL.createObjectURL(file);
  a.download = fileName + '.json';
  a.click();
}

export function generateID() {
  return PROJECT_PREFIX + nanoid();
}

export function getColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

export function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function scale(n: number, s = 1) {
  return n * s;
}

export function round(value: number, decimals: number = 4) {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

export function jsonCopy(data: any) {
  return JSON.parse(JSON.stringify(data));
}

(globalThis as any)._l = console.log;
(globalThis as any)._d = console.dir;
