<script lang="ts">
  import { getMidPoint } from './helpers/geometry';
  import { blockEntriesExtended, updateBlock } from './store/blocks';
  import { gleisPlannedDB } from './store/gleis';

  $: blocks = Object.entries($blockEntriesExtended)
    .map(([id, block]) => {
      if (block.symbolAtPoint) {
        return block;
      }

      const firstGleis = block?.gleisAttached[0];

      if (firstGleis) {
        const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = $gleisPlannedDB[
          firstGleis.id
        ].points.filter((point) => point.type === 'c1' || point.type === 'c2');

        const gleisPoint = getMidPoint(x1, y1, x2, y2);

        return {
          ...block,
          symbolAtPoint: gleisPoint,
        };
      }

      return null;
    })
    .filter((x) => x !== null);

  // $: console.log(blocks);
</script>

{#each blocks as block}
  <g>
    <title>{block.title}</title>
    <rect
      x={block.symbolAtPoint.x}
      y={block.symbolAtPoint.y}
      width="30px"
      height="20px"
      class="BlockSymbol"
      class:is-occupied={block.occupied}
      on:click={() => {
        updateBlock({ id: block.id, occupied: !block.occupied });
      }}
    />
  </g>
{/each}

<style>
  .BlockSymbol {
    fill: green;
    cursor: pointer;
  }
  .BlockSymbol.is-occupied {
    fill: red;
  }
</style>
