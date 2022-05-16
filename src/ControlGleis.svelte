<script lang="ts">
  import {
    controlGleisIdsActive,
    setControlGleisIdsActive,
    activeRouteSegments,
  } from './store/gleis';
  import { previewControlRoute } from './store/sections';

  import type { GleisPropsPlanned, ProtoGleis } from './types';

  export let gleisProps: GleisPropsPlanned;
  export let proto: ProtoGleis;
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
  {#if gleisProps.pathSegments}
    {#each gleisProps.pathSegments as pathSegment, index (pathSegment)}
      <path
        d={pathSegment.d.toString()}
        class={`basepath`}
        on:click={() => {
          setControlGleisIdsActive([gleisProps.id]);
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
</style>
