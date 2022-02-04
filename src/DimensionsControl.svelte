<script lang="ts">
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { dimensions, setDimensions } from './store/workspace';
  import type { Dimensions } from './types';

  function changeDimension(prop: keyof Dimensions, value: number) {
    setDimensions((dimensions) => ({ ...dimensions, [prop]: value }));
  }
</script>

<ControlMenuPanel
  flex={false}
  startMinimized={true}
  toggle={true}
  title="Dimensions"
>
  <label>
    width
    <input
      type="number"
      size="4"
      value={$dimensions.width}
      on:change={(event) =>
        changeDimension('width', parseInt(event.currentTarget.value, 10))}
    />
  </label>
  <label>
    height
    <input
      type="number"
      size="4"
      value={$dimensions.height}
      on:change={(event) =>
        changeDimension('height', parseInt(event.currentTarget.value, 10))}
    />
  </label>
</ControlMenuPanel>

<style>
</style>
