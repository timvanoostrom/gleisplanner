<script lang="ts">
  import Button from './Button.svelte';
  import { MAX_SCALE, MIN_SCALE } from './config/constants';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { round } from './helpers/app';
  import { scale, setScale, setViewBoxTranslation } from './store/workspace';

  function resetScale() {
    setViewBoxTranslation(null);
    setScale(1);
  }
</script>

<ControlMenuPanel title="Scale">
  <Button on:click={resetScale}>reset</Button>
  <span>{round($scale, 2).toFixed(2)}</span>
  <Button on:click={() => setScale(Math.max(0, $scale - 0.01))}>-</Button>
  <input
    type="range"
    min={MIN_SCALE}
    max={MAX_SCALE}
    step={0.01}
    value={$scale}
    on:input={(event) => {
      setScale(parseFloat(event.currentTarget.value));
    }}
  />
  <Button on:click={() => setScale($scale + 0.01)}>+</Button>
</ControlMenuPanel>

<style>
</style>
