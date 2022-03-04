<script lang="ts">
  import { gleisIdsActive } from './store/gleis';

  import { setConfigItem } from './store/gleisConfig';

  import type { GleisPropsPlanned, Point } from './types';

  export let gleisProps: GleisPropsPlanned;
  export let parentNode: SVGGElement;

  function setWendelConnectPoint(point: Point) {
    setConfigItem({
      ids: [gleisProps.id],
      param: 'wendel-connect',
      value: point,
    });
  }
  $: isActive = $gleisIdsActive.includes(gleisProps.id);
  $: cPoints = gleisProps.points.filter(
    (p) => p.type === 'c1' || p.type === 'c2'
  );
  $: boundsSelected = isActive && parentNode?.getBBox();
  $: wendelConnectPoint = gleisProps?.config?.['wendel-connect'];
  $: console.log(boundsSelected, wendelConnectPoint);
</script>

{#if !!wendelConnectPoint}
  <g class="wendelConnect">
    {#if boundsSelected}
      <g class="wendelConnect-buttons">
        {#each cPoints as point, index}
          <g
            class="wendelConnect-button"
            on:click={() => setWendelConnectPoint(point)}
          >
            <rect
              x={boundsSelected.x + index * (30 + 4)}
              y={boundsSelected.y}
              class="wendelConnect-button-rect"
            />
            <text
              x={boundsSelected.x + index * (30 + 4) + 30 / 2}
              y={boundsSelected.y + 19}
              class="wendelConnect-button-label"
            >
              {point.type}
            </text>
          </g>
        {/each}
      </g>
    {/if}
    {#if wendelConnectPoint}
      <rect
        x={wendelConnectPoint.x - 50 / 2}
        y={wendelConnectPoint.y - 18}
        width="50"
        height="24"
        class="wendelConnect-bg"
      />
      <text
        class="wendelConnect-label"
        x={wendelConnectPoint.x}
        y={wendelConnectPoint.y}
      >
        Wendel connect
      </text>
    {/if}
  </g>
{/if}

<style>
  .wendelConnect-bg {
    fill: red;
  }
  .wendelConnect-button-label {
    fill: white;
    text-anchor: middle;
  }
  .wendelConnect-button:hover {
    cursor: pointer;
  }
  .wendelConnect-button:hover .wendelConnect-button-rect {
    fill: blue;
  }
  .wendelConnect-button-rect {
    width: 30px;
    height: 30px;
    fill: red;
  }
</style>
