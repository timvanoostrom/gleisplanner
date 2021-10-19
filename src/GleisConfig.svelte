<script lang="ts">
  import Button from './Button.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { gleisIdsActive, gleisPlannedDB, updateGleis } from './store/gleis';
  import type { GleisConfig, GleisPropsPlanned } from './types';

  type Param = keyof GleisConfig;

  const params: Param[] = [
    'bridge',
    'tunnel',
    'feedback',
    'block',
    'isolation',
    'dc-connect',
  ];

  interface ToggleConfigItemProps {
    ids: Array<GleisPropsPlanned['id']>;
    param: Param;
    value: any;
  }

  function unsetConfigItem({
    ids,
    param,
  }: Omit<ToggleConfigItemProps, 'value'>) {
    setConfigItem({
      ids,
      param,
      value: undefined,
    });
  }

  function setConfigItem({ ids, param, value }: ToggleConfigItemProps) {
    const updates = ids.map((id) => {
      const config = $gleisPlannedDB[id].config || {};
      if (param in config && value === undefined) {
        delete config[param];
      } else {
        config[param] = value;
      }
      for (const key of Object.keys(config)) {
        if (!params.includes(key as Param)) {
          delete config[key];
        }
      }
      return {
        id,
        config: Object.keys(config).length ? config : undefined,
      };
    });
    updateGleis(updates);
  }

  $: configParamsActive = $gleisIdsActive.length
    ? params.filter((param) => {
        return $gleisIdsActive.every((id) => {
          return $gleisPlannedDB[id]?.config?.[param] !== undefined;
        });
      })
    : [];

  function clearConfig() {
    for (const param of params) {
      unsetConfigItem({
        ids: $gleisIdsActive,
        param,
      });
    }
  }
</script>

<ControlMenuPanel title="Shapes & Symbols">
  <Button on:click={clearConfig}>Clear</Button> &mdash;
  {#each params as param}
    <Button
      isActive={configParamsActive.includes(param)}
      on:click={() => {
        if (configParamsActive.includes(param)) {
          unsetConfigItem({ ids: $gleisIdsActive, param });
        } else {
          setConfigItem({ ids: $gleisIdsActive, param, value: 1 });
        }
      }}>{param}</Button
    >
  {/each}
</ControlMenuPanel>
