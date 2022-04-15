import {
  gleisIdsActive,
  gleisPlannedDB,
  gleisPlannedSelected,
  updateGleis,
} from './gleis';
import type { GleisConfig, GleisPropsPlanned } from '../types';
import { get } from 'svelte/store';

export type Param = keyof GleisConfig;

export const params: Param[] = [
  'feedback',
  'wendel-connect',
  'bridge',
  'tunnel',
];

export interface ToggleConfigItemProps {
  ids: Array<GleisPropsPlanned['id']>;
  param: Param;
  value?: any;
}

export function unsetConfigItem({
  ids: gleisIds,
  param,
}: Omit<ToggleConfigItemProps, 'value'>) {
  setConfigItem({
    ids: gleisIds,
    param,
    value: null,
  });
}

export function getConfigDefaultValue({
  ids: gleisIds,
  param,
  value = 1,
}: ToggleConfigItemProps) {
  let configValue = value;

  switch (param) {
    case 'wendel-connect':
      if (gleisIds.length > 1) {
        throw new Error(
          'Wendel connect can only be set to one gleis at a time.'
        );
      }
      const [gleisId] = gleisIds;
      const gleisProps = get(gleisPlannedDB)[gleisId];
      return gleisProps.points.find(
        (point) => point.type === 'c1' || point.type === 'c2'
      );
  }

  return configValue;
}

export function setConfigItem({
  ids: gleisIds,
  param,
  value,
}: ToggleConfigItemProps) {
  let configValue =
    value !== null
      ? typeof value !== 'undefined'
        ? value
        : getConfigDefaultValue({ ids: gleisIds, param, value })
      : value;

  const updates = gleisIds.map((id) => {
    const config = get(gleisPlannedDB)[id].config || {};

    if (param in config && configValue === null) {
      delete config[param];
    } else {
      config[param] = configValue;
    }

    for (const key of Object.keys(config)) {
      if (!params.includes(key as Param)) {
        delete config[key];
      }
    }

    const hasConfigKeys = !!Object.keys(config).length;

    return {
      id,
      config: hasConfigKeys ? config : undefined,
    };
  });

  updateGleis(updates);
}

export function clearConfig(gleisIds: string[]) {
  for (const param of params) {
    unsetConfigItem({
      ids: gleisIds,
      param,
    });
  }
}
