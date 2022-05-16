<script lang="ts">
  import { getMidPoint } from './helpers/geometry';
  import {
    sectionEntriesExtended,
    sectionIdsSelected,
    selectSection,
  } from './store/sections';
  import { gleisPlannedDB } from './store/gleis';
  import { toggleTool } from './store/workspace';

  $: sections = Object.entries($sectionEntriesExtended)
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
</script>

{#each sections as section}
  <g
    on:click={(event) => {
      // updateSection({ id: section.id, isActivated: !section.isActivated });
      selectSection(section.id, !event.shiftKey);
    }}
    on:dblclick={() => {
      // toggleTool('section', {
      //   action: 'update',
      //   data: section,
      // });
    }}
  >
    <title>{section.title}</title>
    <text
      x={section.symbolAtPoint.x}
      y={section.symbolAtPoint.y - 20}
      class="BlockLabel">{section.blockTitle}</text
    >
    <rect
      x={section.symbolAtPoint.x - 20}
      y={section.symbolAtPoint.y - 15}
      width="40px"
      height="30px"
      class="SectionSymbol"
      class:is-activated={section.isActivated}
      class:is-selected={$sectionIdsSelected.includes(section.id)}
    />
    {#if !!section.blockId}
      <circle
        r="8"
        cx={section.symbolAtPoint.x}
        cy={section.symbolAtPoint.y}
        class="SectionSymbol-block"
      />
    {/if}
  </g>
{/each}

<style>
  .SectionSymbol {
    fill: lightgreen;
    cursor: pointer;
  }
  .SectionSymbol.is-activated {
    fill: red;
  }
  .SectionSymbol.is-selected {
    fill: blue;
    /* paint-order: stroke; */
  }
  .SectionSymbol.is-selected + .SectionSymbol-block {
    fill: lightblue;
  }
  .SectionSymbol.SectionSymbol.is-activated + .SectionSymbol-block {
    fill: darkred;
  }
  .SectionSymbol-block {
    fill: green;
  }
  .BlockLabel {
    width: 50px;
    font-size: 2.4em;
    text-anchor: middle;
  }
</style>
