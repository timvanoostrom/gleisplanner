<script lang="ts">
  import { range } from './helpers/app';
  import { dimensions, gridSize } from './store/workspace';

  $: gridWidth = $gridSize.width;
  $: gridHeight = $gridSize.height;

  $: countX = Math.floor($dimensions.width / gridWidth);
  $: countY = Math.floor($dimensions.height / gridHeight);

  $: linesX = range(0, countX);
  $: linesY = range(0, countY);

  $: xWidth = $dimensions.width / 2;
  $: yWidth = $dimensions.height / 2;
</script>

{#each linesX as line (line + gridWidth + gridHeight + 'x')}
  <line
    x1={-xWidth + line * gridWidth}
    y1={-yWidth}
    x2={-xWidth + line * gridWidth}
    y2={yWidth}
  />
{/each}
{#each linesY as line (line + gridWidth + gridHeight + 'y')}
  <line
    x1={-xWidth}
    y1={-yWidth + line * gridHeight}
    x2={xWidth}
    y2={-yWidth + line * gridHeight}
  />
{/each}

<style>
  line {
    stroke: #000;
    stroke-opacity: 0.8;
    stroke-dasharray: 2px 2px;
    stroke-width: 1;
    /* shape-rendering: optimizeSpeed; */
  }
</style>
