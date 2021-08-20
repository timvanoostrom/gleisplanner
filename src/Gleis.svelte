<script lang="ts">
  import { svgPathProperties } from 'svg-path-properties';

  import {
    generateSegments,
    gleisIdsActive,
    setGleisIdActive,
  } from './store/gleis';
  import { activeLayer, layersById } from './store/layerControl';
  import { editMode } from './store/workspace';
  import type { GleisPropsPlanned, ProtoGleis } from './types';

  export let gleisProps: GleisPropsPlanned;
  export let proto: ProtoGleis;

  $: isActive = $gleisIdsActive.includes(gleisProps.id);
  $: pathSegments = [];
  $: {
    try {
      pathSegments = generateSegments(gleisProps, proto);
    } catch (err) {
      console.error('Bad segment generation.', err);
      // console.error(err);
    }
  }

  $: gleisLayerPatternId = $layersById[gleisProps.layerId]?.patternId || '';
  $: gleisFillColor = $layersById[gleisProps.layerId]?.color || 'red';

  $: pathLen = pathSegments.reduce((acc, p) => {
    return acc + new svgPathProperties(p.d.toString()).getTotalLength();
  }, 0);
</script>

<g
  id={gleisProps.id}
  class="Gleis"
  class:isActive
  data-pathLen={pathLen}
  on:click={(event) => {
    event.stopPropagation();
    if (
      !$activeLayer.locked &&
      $activeLayer.isVisible &&
      $editMode === 'gleis'
    ) {
      setGleisIdActive(gleisProps.id, event.shiftKey);
    }
  }}
  style={`--gleis-fill-color:${gleisFillColor};${
    gleisLayerPatternId
      ? `--gleis-fill-pattern: url(#pattern-${gleisLayerPatternId})`
      : ''
  }`}
>
  <title>{proto.title} - {proto.artnr}</title>
  {#each pathSegments as pathSegment, index (pathSegment)}
    <path d={pathSegment.d.toString()} class={`spath ${pathSegment.type}`} />
  {/each}
</g>

<style>
  .spath {
    fill: none;
  }
  .main {
    stroke: black;
    stroke-opacity: 0;
    stroke-dasharray: 4px 4px;
  }
  .splits {
    stroke: black;
    stroke-opacity: 1;
  }
  .outer {
    stroke-width: 0;
    fill: var(--gleis-fill-pattern, var(--gleis-fill-color));
    fill-opacity: 1;
  }
  .Gleis:hover .outer {
    fill: #eee;
  }
  .isActive .outer {
    stroke-width: 2px;
    stroke: rgb(19, 77, 1);
    fill: rgb(218, 255, 213);
    fill: url(#pattern3);
    paint-order: stroke;
    stroke-linecap: square;
  }
  .p1 {
    stroke: red;
  }
  .p2 {
    stroke: #000;
  }
  .add {
    /* stroke-width: 2px; */
    /* stroke: #000; */
    fill: #000;
    stroke: none;
  }
  .add + .add {
    /* stroke: blue; */
  }
</style>
