<script lang="ts">
  import { controlGleisIdsActive } from './store/gleis';
  import {
    previewControlRoute,
    activeRouteSegments,
    locoStackByGleisId,
    activeLinkRegistry,
  } from './store/sections';

  import type { GleisPropsPlanned, ProtoGleis } from './types';

  export let gleisProps: GleisPropsPlanned;
  export let proto: ProtoGleis;

  $: centerPoint = gleisProps.points.find((p) => p.type === 'lbl');
</script>

<g
  id={gleisProps.id}
  class="Gleis"
  class:hasTunnel={!!gleisProps?.config?.tunnel}
  class:hasBridge={!!gleisProps?.config?.bridge}
  class:trackPointSelectEnabled={false}
  class:isActive={$controlGleisIdsActive.includes(gleisProps.id)}
  on:click={(event) => {}}
>
  <title>{proto.title} - {proto.artnr}</title>
  {#if $locoStackByGleisId[gleisProps.id] && centerPoint}
    <g class="LocoStack">
      <line
        x1={centerPoint.x}
        y1={centerPoint.y}
        x2={centerPoint.x}
        y2={centerPoint.y + 37}
        class="LocoStack-tether"
      />
      {#each $locoStackByGleisId[gleisProps.id] as locoID, index}
        <text
          class:is-current={$activeLinkRegistry?.[locoID]?.currentID ===
            gleisProps.id}
          class:is-next={$activeLinkRegistry?.[locoID]?.nextID ===
            gleisProps.id}
          x={centerPoint.x}
          y={60 + centerPoint.y + 30 * index}
        >
          {locoID}
        </text>
      {/each}
    </g>
  {/if}
  {#if gleisProps.pathSegments}
    {#each gleisProps.pathSegments as pathSegment, index (pathSegment)}
      <path
        d={pathSegment.d.toString()}
        class={`basepath`}
        on:click={() => {
          // setControlGleisIdsActive([gleisProps.id]);
        }}
      />
      <path
        d={pathSegment.d.toString()}
        class={`spath ${pathSegment.type}`}
        class:bezetz={$activeRouteSegments.includes(pathSegment.d.toString())}
        class:preview={$previewControlRoute.includes(pathSegment.d.toString())}
      />
    {/each}
  {/if}
</g>

<style>
  .basepath {
    fill: none;
    stroke-width: 20px;
    stroke-opacity: 0;
    stroke: red;
  }
  .spath {
    fill: none;
    /* transform: perspective(300px) rotateX(30deg); */
  }
  .main {
    stroke: black;
    stroke-opacity: 0.6;
    stroke-width: 6px;
  }
  .branch {
    stroke: black;
  }
  .main.bezetz,
  .branch.bezetz {
    stroke-opacity: 1;
    stroke: purple;
    stroke-width: 10px;
  }
  .main.preview,
  .branch.preview {
    stroke-opacity: 1;
    stroke: orange;
    stroke-width: 10px;
  }
  .trackPointSelectEnabled .main {
    stroke-opacity: 1;
  }
  .isActive .main {
    stroke: red;
  }
  .LocoStack text {
    font-size: 26px;
    text-anchor: middle;
  }
  .LocoStack-tether {
    stroke: black;
  }
  .is-next {
    fill: orange;
  }
  .is-current {
    fill: green;
    font-weight: bold;
  }
</style>
