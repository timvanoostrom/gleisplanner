<script lang="ts">
  import { getMidPoint } from './helpers/geometry';
  import { blockEntriesExtended, updateSection } from './store/sections';
  import { gleisPlannedDB } from './store/gleis';
  import { toggleTool } from './store/workspace';

  $: blocks = Object.entries($blockEntriesExtended)
    .map(([id, section]) => {
      if (section.symbolAtPoint) {
        return section;
      }

      const firstGleis = section?.gleisAttached[0];

      if (firstGleis) {
        const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = $gleisPlannedDB[
          firstGleis.id
        ].points.filter((point) => point.type === 'c1' || point.type === 'c2');

        const gleisPoint = getMidPoint(x1, y1, x2, y2);

        return {
          ...section,
          symbolAtPoint: gleisPoint,
        };
      }

      return null;
    })
    .filter((x) => x !== null);

  // $: console.log(blocks);
</script>

{#each blocks as section}
  <g
    on:click={() => {
      updateSection({ id: section.id, occupied: !section.occupied });
    }}
    on:dblclick={() => {
      toggleTool('section', {
        action: 'update',
        data: section,
      });
    }}
  >
    <title>{section.title}</title>
    <rect
      x={section.symbolAtPoint.x}
      y={section.symbolAtPoint.y}
      width="30px"
      height="20px"
      class="SectionSymbol"
      class:is-occupied={section.occupied}
    />
  </g>
{/each}

<style>
  .SectionSymbol {
    fill: green;
    cursor: pointer;
  }
  .SectionSymbol.is-occupied {
    fill: red;
  }
</style>
