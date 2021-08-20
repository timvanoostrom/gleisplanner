<script lang="ts">
  import Button from './Button.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import Icon from './Icon.svelte';
  import { APP_CONFIG_DEFAULT } from './store/appConfig';
  import {
    gridSize,
    isGridVisible,
    setGridSize,
    setGridVisible,
  } from './store/workspace';
  import type { Dimensions } from './types';

  function resetGridSize() {
    setGridSize(APP_CONFIG_DEFAULT.gridSize);
  }

  function changeGridSize(prop: keyof Dimensions, value: number) {
    setGridSize((gridSize) => ({ ...gridSize, [prop]: value }));
  }
</script>

<ControlMenuPanel flex={false} startMinimized={true} toggle={true} title="Grid">
  <Button variant="plain" on:click={() => setGridVisible(!$isGridVisible)}>
    <Icon name={!$isGridVisible ? 'eye-slash' : 'eye'} />
  </Button>
  <label
    >width <input
      type="number"
      size="4"
      value={$gridSize.width}
      on:change={(event) =>
        changeGridSize('width', parseInt(event.currentTarget.value, 10))}
    /></label
  >
  <label
    >height <input
      type="number"
      size="4"
      value={$gridSize.height}
      on:change={(event) =>
        changeGridSize('height', parseInt(event.currentTarget.value, 10))}
    /></label
  >
  <Button on:click={resetGridSize}>reset</Button>
</ControlMenuPanel>

<style>
</style>
