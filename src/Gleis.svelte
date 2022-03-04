<script lang="ts">
  import Button from './Button.svelte';

  import GleisBridge from './GleisBridge.svelte';
  import GleisWendelConnect from './GleisWendelConnect.svelte';
  import {
    getCoordString,
    gleisBezetz,
    gleisIdsActive,
    setGleisIdActive,
  } from './store/gleis';
  import { setConfigItem } from './store/gleisConfig';
  import { layersById } from './store/layerControl';
  import type {
    GleisPropsPlanned,
    PathSegmentProps,
    Point,
    ProtoGleis,
  } from './types';

  export let gleisProps: GleisPropsPlanned;
  export let proto: ProtoGleis;
  export let disabled: boolean = false;
  export let bezetzSegment: string = '';

  let node: SVGGElement;

  function isBezetz(pathSegment: PathSegmentProps): boolean {
    return (
      (pathSegment.type === 'main' || pathSegment.type === 'branch') &&
      bezetzSegment === pathSegment.gleisType
    );
  }

  $: isActive = $gleisIdsActive.includes(gleisProps.id);
  $: gleisLayerPatternId = $layersById[gleisProps.layerId]?.patternId || '';
  $: gleisFillColor = $layersById[gleisProps.layerId]?.color || 'red';
  $: addPoints = gleisProps.points.filter((p) => p.type === 'add');
</script>

<g
  bind:this={node}
  id={gleisProps.id}
  class="Gleis"
  class:isActive
  class:hasTunnel={!!gleisProps?.config?.tunnel && !bezetzSegment}
  class:hasBridge={!!gleisProps?.config?.bridge && !bezetzSegment}
  on:click={(event) => {
    if (!disabled) {
      event.stopPropagation();
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
  {#if gleisProps.pathSegments}
    {#if gleisProps?.config?.bridge}
      <GleisBridge {gleisProps} />
    {/if}
    {#each gleisProps.pathSegments as pathSegment, index (pathSegment)}
      <path
        d={pathSegment.d.toString()}
        class={`spath ${pathSegment.type}`}
        class:bezetz={isBezetz(pathSegment)}
      />
    {/each}
  {/if}

  {#each addPoints as addPoint}
    <circle r="5" cx={addPoint.x} cy={addPoint.y} class="AddPoint" />
  {/each}

  <GleisWendelConnect {gleisProps} parentNode={node} />
</g>

<style>
  .spath {
    fill: none;
    /* transform: perspective(300px) rotateX(30deg); */
  }
  .main {
    stroke: black;
    stroke-opacity: 0;
  }
  .branch {
    stroke: black;
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
  .branch.bezetz,
  .main.bezetz {
    stroke-dasharray: 4px 4px;
    stroke-opacity: 1;
    stroke: purple;
    stroke-width: 10px;
  }
  .connect {
    stroke: red;
    stroke-width: 2px;
  }
  .AddPoint {
    fill: red;
  }
</style>
