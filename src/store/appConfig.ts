import localforage from 'localforage';
import { derived, writable } from 'svelte/store';
import type { AppConfig } from '../types';

export const APP_CONFIG_DEFAULT: AppConfig = {
  dimensions: { width: 5500, height: 2800 }, // 1px = 1mm
  gridSize: { width: 500, height: 500 },
  gridVisible: true,
  currentZoom: { zoom: 1, pan: { x: 0, y: 0 } },
  protoGleisIdActive: 'roco-42441',
  gleisIdsActive: [],
  viewBoxTranslation: null,
  trackLibQuickSelect: null,
  sidebarState: 'visible',
  activeTrackLibId: 'roco-line',
};

export const initializers = [];

export function db<T>(key: string, initialData: T) {
  const db = writable(initialData);
  const sync = localforage
    .getItem<T>(key)
    .then((data) => {
      if (data !== null && data !== undefined) {
        if (
          typeof initialData === 'object' &&
          !Array.isArray(data) &&
          !Array.isArray(initialData)
        ) {
          db.set({ ...initialData, ...data });
        } else {
          db.set(data ?? initialData);
        }
      }
    })
    .catch((e) => {
      console.log('eeee', e);
    });

  initializers.push(sync);

  sync.then(() => {
    db.subscribe((data) => {
      localforage.setItem(key, data);
    });
  });

  return db;
}

export const appConfig = db('appConfig', APP_CONFIG_DEFAULT);
export function isAppConfigReady() {
  return Promise.all(initializers);
}

export function appConfigSetting(key: keyof AppConfig) {
  return derived(appConfig, (appConfig) => appConfig[key]);
}

export function setAppConfigSetting(
  key: keyof AppConfig,
  value:
    | AppConfig[keyof AppConfig]
    | ((value: AppConfig[keyof AppConfig]) => AppConfig[keyof AppConfig])
) {
  appConfig.update((appConfig) => {
    const updatedValue =
      typeof value === 'function' ? value(appConfig[key]) : value;
    return {
      ...appConfig,
      [key]: updatedValue,
    };
  });
}

export function appConfigValue<T extends AppConfig[keyof AppConfig]>(
  key: keyof AppConfig
) {
  const appConfigSetting = derived(appConfig, (appConfig) => {
    return (appConfig[key] ?? APP_CONFIG_DEFAULT[key]) as T;
  });

  return [
    appConfigSetting,
    (value: T | ((value: T) => T)) => {
      setAppConfigSetting(key, value);
    },
  ] as const;
}
