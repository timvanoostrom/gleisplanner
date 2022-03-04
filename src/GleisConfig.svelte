<script lang="ts">
  import Button from './Button.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { gleisIdsActive, gleisPlannedDB, updateGleis } from './store/gleis';
  import {
    clearConfig,
    params,
    setConfigItem,
    unsetConfigItem,
  } from './store/gleisConfig';

  $: configParamsActive = $gleisIdsActive.length
    ? params.filter((param) => {
        return $gleisIdsActive.every((id) => {
          return $gleisPlannedDB[id]?.config?.[param] !== undefined;
        });
      })
    : [];
</script>

<ControlMenuPanel title="Shapes & Symbols">
  <Button on:click={() => clearConfig($gleisIdsActive)}>Clear</Button> &mdash;
  {#each params as param}
    <Button
      isActive={configParamsActive.includes(param)}
      on:click={() => {
        if (configParamsActive.includes(param)) {
          unsetConfigItem({ ids: $gleisIdsActive, param });
        } else {
          setConfigItem({ ids: $gleisIdsActive, param });
        }
      }}>{param}</Button
    >
  {/each}
</ControlMenuPanel>
