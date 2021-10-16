<script lang="ts">
  import GuidePath from './GuidePath.svelte';
  import GuidesControl from './GuidesControl.svelte';
  import { guidesInLayer, guidesToolEnabled } from './store/workspace';
  import type { Point } from './types';

  function points(points: Point[]) {
    return points.filter((point) => !!point);
  }
</script>

<g class="Guides">
  {#if $guidesToolEnabled}
    <GuidesControl />
  {:else}
    {#each $guidesInLayer as guide}
      <GuidePath points={points(guide.points)} />
    {/each}
  {/if}
</g>
