import { derived, writable } from 'svelte/store';
import { toRad } from '../helpers/geometry';
import type { ProtoGleis } from '../types';
import { trackLibrary as RocoLine } from './libs/roco-line';
import { trackLibrary as PikoA } from './libs/piko-a-gleis';
import { appConfigValue } from '../store/appConfig';

export const trackLibs = writable({
  [RocoLine.id]: RocoLine,
  [PikoA.id]: PikoA,
});

export const [activeTrackLibId, setActiveTrackLibId] =
  appConfigValue<string>('activeTrackLibId');

export const trackLib = derived(trackLibs, (trackLibs) => {
  return Object.entries(trackLibs).flatMap(([libId, { gleis }]) => {
    return gleis.map((gleis) => {
      const segments = gleis.segments.filter((s: any) => !!s.angle);
      segments.forEach((segments: any) => {
        segments.angle = toRad(segments.angle);
      });
      gleis.libId = libId;
      return gleis;
    });
  });
});

export const trackLibByArtNr = derived(trackLibs, (trackLibs) => {
  return Object.fromEntries(
    Object.values(trackLibs).flatMap((trackLib) =>
      trackLib.gleis.map((track) => [
        track.artnr,
        { ...track, brand: trackLib.title },
      ])
    )
  );
});

export const trackLibById = derived(trackLib, (trackLib) => {
  return Object.fromEntries(trackLib.map((track) => [track.id, track]));
});

export const trackLibByCategory = derived(
  [trackLib, activeTrackLibId],
  ([trackLib, activeTrackLibId]) => {
    const byCategory = trackLib
      .filter((gleis) => gleis.libId === activeTrackLibId)
      .reduce((byCategory, gleis) => {
        const type = gleis.category || gleis.type;
        if (!byCategory[type]) {
          byCategory[type] = [];
        }
        byCategory[type].push(gleis);
        return byCategory;
      }, {} as Record<string, ProtoGleis[]>);

    return Object.entries(byCategory);
  }
);

export const [trackLibQuickSelect, setTrackLibQuickSelect] = appConfigValue<
  Record<string, string>
>('trackLibQuickSelect');

trackLibByCategory.subscribe((trackLibByCategory) => {
  setTrackLibQuickSelect(
    Object.fromEntries(
      trackLibByCategory.map(([type, gleis]) => {
        return [type, gleis[0].id];
      })
    )
  );
});
