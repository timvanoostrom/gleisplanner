<script lang="ts">
  import GuidePath from './GuidePath.svelte';
  import GuideRect from './GuideRect.svelte';
  import GuidesControl from './GuidesControl.svelte';
  import { guidesInLayer, tools } from './store/workspace';
  import type { Point } from './types';

  function points(points: Point[]) {
    return points.filter((point) => !!point);
  }
</script>

<g class="Guides">
  {#if $tools.guides}
    <GuidesControl />
  {:else}
    {#each $guidesInLayer as guide}
      {#if guide.type === 'rect'}
        <GuideRect {guide} noselect />
      {:else}
        <GuidePath {guide} />
      {/if}
    {/each}
  {/if}
</g>
