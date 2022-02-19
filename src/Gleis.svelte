<script lang="ts">
  import { startRouteAt } from './BezetzController';

  import GleisBridge from './GleisBridge.svelte';
  import {
    getCoordString,
    gleisBezetz,
    gleisIdsActive,
    setGleisIdActive,
  } from './store/gleis';
  import { layersById } from './store/layerControl';
  import { tools } from './store/workspace';
  import type {
    GleisPropsPlanned,
    PathSegmentProps,
    ProtoGleis,
  } from './types';

  export let gleisProps: GleisPropsPlanned;
  export let proto: ProtoGleis;
  export let disabled: boolean = false;

  $: isActive = $gleisIdsActive.includes(gleisProps.id);
  $: gleisLayerPatternId = $layersById[gleisProps.layerId]?.patternId || '';
  $: gleisFillColor = $layersById[gleisProps.layerId]?.color || 'red';

  $: isBezets = gleisProps.id in $gleisBezetz;
  $: addPoints = gleisProps.points.filter((p) => p.type === 'add');

  function isSegmentBezets(segment: PathSegmentProps) {
    if (isBezets) {
      return true;
    }
  }
</script>

<g
  id={gleisProps.id}
  class={`Gleis`}
  class:isActive
  class:hasTunnel={!!gleisProps?.config?.tunnel}
  class:hasBridge={!!gleisProps?.config?.bridge}
  class:bezetz={isBezets}
  on:click={(event) => {
    if (!disabled) {
      event.stopPropagation();
      if ($tools.routeSimulation) {
        startRouteAt(gleisProps.id);
      } else {
        setGleisIdActive(gleisProps.id, event.shiftKey);
      }
    }
  }}
  style={`--gleis-fill-color:${gleisFillColor};${
    gleisLayerPatternId
      ? `--gleis-fill-pattern: url(#pattern-${gleisLayerPatternId})`
      : ''
  }`}
>
  <title>{proto.title} - {proto.artnr}</title>
  {#if gleisProps.pathSegments}
    {#if gleisProps?.config?.bridge}
      <GleisBridge {gleisProps} />
    {/if}
    {#each gleisProps.pathSegments as pathSegment, index (pathSegment)}
      <path
        d={pathSegment.d.toString()}
        class={`spath ${pathSegment.type}`}
        class:bezets={isSegmentBezets(pathSegment)}
      />
    {/each}
  {/if}
  {#if $gleisBezetz?.[gleisProps.id]?.length === 3 && $gleisBezetz[gleisProps.id][1] !== null}
    <line
      x1={$gleisBezetz[gleisProps.id][0].x}
      y1={$gleisBezetz[gleisProps.id][0].y}
      x2={$gleisBezetz[gleisProps.id][1].x}
      y2={$gleisBezetz[gleisProps.id][1].y}
      class="connect"
    />
  {/if}
  {#each addPoints as addPoint}
    <circle r="5" cx={addPoint.x} cy={addPoint.y} class="AddPoint" />
  {/each}
</g>

<style>
  .spath {
    fill: none;
    /* transform: perspective(300px) rotateX(30deg); */
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
  .hasTunnel .spath {
    opacity: 0.4;
  }
  .main.bezetz {
    stroke-opacity: 1;
    stroke: purple;
    stroke-width: 10px;
  }
  .bezetz .spath {
    stroke-opacity: 1;
    stroke: purple;
    stroke-width: 1px;
  }
  .connect {
    stroke: red;
    stroke-width: 2px;
  }
  .AddPoint {
    fill: red;
  }
</style>
