<script lang="ts">
  import { onMount } from 'svelte';
  import { A90 } from './config/constants';
  import {
    calculateFlexPoints,
    connectFlexPointStart,
    generateFlexPaths,
  } from './helpers/flex';
  import { cAngle, toRad } from './helpers/geometry';
  import { baseGroupPoint } from './helpers/svg';
  import {
    connectGleis,
    protoGleisActive,
    singleFlexActive,
    updateGleis,
  } from './store/gleis';
  import { baseGroup, planeSvg } from './store/plane';
  import type { ProtoSegmentFlex } from './types';

  // drag handler
  let drag: boolean = false;
  let indexes;

  const protoSegment = $protoGleisActive.segments[0] as ProtoSegmentFlex;

  $: flexPoints = [];
  $: flexPaths =
    flexPoints.length === 4
      ? generateFlexPaths(flexPoints, protoSegment)
      : null;
  $: p3 = flexPoints && flexPoints[3];

  onMount(() => {
    console.info('FlexModeller active', $singleFlexActive);
    if ($singleFlexActive) {
      flexPoints = $singleFlexActive.points;
    }
  });

  const onDragFlexPointEnd = (event) => {
    if (!$connectFlexPointStart) {
      return;
    }
    const connectPoint = baseGroupPoint(
      $planeSvg,
      $baseGroup,
      $baseGroup as SVGGeometryElement,
      {
        x: event.clientX,
        y: event.clientY,
      }
    );

    flexPoints = calculateFlexPoints({
      pointOrigin: {
        ...connectPoint,
        connectAngle: -1,
        type: 'c1',
      },
      proto: protoSegment,
    });
  };

  let prevX;
  let prevY;
  let deltaX = 0;
  let deltaY = 0;
  let moveHorizontal;
  let moveVertical;

  function onDragControlPoint(event: MouseEvent, index?: 1 | 2) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (index) {
      // 1 is CP1
      // 2 is CP2
      indexes = [index];
    }

    const type = event.type;

    // start drag
    if (!drag && type === 'pointerdown') {
      drag = true;
    }

    // move element
    if (drag && type === 'pointermove') {
      deltaY += Math.abs(event.movementY);
      deltaX += Math.abs(event.movementX);

      moveHorizontal = deltaX > deltaY;
      moveVertical = !moveHorizontal;

      if (!prevX && !prevY) {
        prevX = event.clientX;
        prevY = event.clientY;
      }

      const { x, y } = baseGroupPoint(
        $planeSvg,
        $baseGroup,
        $baseGroup as SVGGeometryElement,
        {
          x: moveVertical && event.shiftKey && prevX ? prevX : event.clientX,
          y: moveHorizontal && event.shiftKey && prevY ? prevY : event.clientY,
        }
      );

      for (const index of indexes) {
        const p = flexPoints[index];
        const index2 = index === 1 ? index - 1 : index + 1;
        const p2 = flexPoints[index2];

        p.x = x;
        p.y = y;

        const angle = toRad(cAngle(p.x, p.y, p2.x, p2.y)) - A90 * p2.direction;
        flexPoints[index2].connectAngle = angle;
        flexPoints[index] = p;
      }
    }

    // stop drag endpoint
    if (drag && type === 'pointerup') {
      drag = false;

      prevX = undefined;
      prevY = undefined;

      deltaX = 0;
      deltaY = 0;

      if ($singleFlexActive) {
        updateGleis([
          {
            id: $singleFlexActive.id,
            points: flexPoints,
          },
        ]);
      }
    }
  }
</script>

<svelte:window
  on:pointermove={(event) => {
    if ($connectFlexPointStart) {
      onDragFlexPointEnd(event);
    }
    if (drag) {
      onDragControlPoint(event);
    }
  }}
  on:dblclick={() => {
    if ($connectFlexPointStart) {
      connectFlexPointStart.set(null);
      connectGleis({
        pointOrigin: flexPoints[0],
        flexPoints,
      });
    }
  }}
/>

{#if flexPaths?.length}
  {#each flexPaths as pathSegment, index (pathSegment)}
    <path d={pathSegment.d.toString()} class={`spath ${pathSegment.type}`} />
  {/each}
{/if}

{#if flexPoints?.length === 4}
  <!-- <Rotator center={p3} /> -->
  <line
    class="TangentLine"
    x1={flexPoints[0].x}
    y1={flexPoints[0].y}
    x2={flexPoints[3].x}
    y2={flexPoints[3].y}
  />
  <line
    class="TangentLine"
    x1={flexPoints[0].x}
    y1={flexPoints[0].y}
    x2={flexPoints[1].x}
    y2={flexPoints[1].y}
  />
  <circle
    class="TangentPoint start"
    on:pointerdown={(event) => onDragControlPoint(event, 1)}
    on:pointerup={(event) => onDragControlPoint(event, 1)}
    r="10"
    cx={flexPoints[1].x}
    cy={flexPoints[1].y}
  />

  <line
    class="TangentLine"
    x1={flexPoints[2].x}
    y1={flexPoints[2].y}
    x2={flexPoints[3].x}
    y2={flexPoints[3].y}
  />
  <circle
    class="TangentPoint end"
    on:pointerdown={(event) => onDragControlPoint(event, 2)}
    on:pointerup={(event) => onDragControlPoint(event, 2)}
    r="10"
    cx={flexPoints[2].x}
    cy={flexPoints[2].y}
  />
{/if}

<style>
  .spath {
    stroke-width: 1px;
    stroke: purple;
    fill: none;
  }
  .main {
    stroke: black;
    stroke-opacity: 0.2;
    stroke-dasharray: 4px 4px;
  }
  .outer {
    stroke: #ccc;
    fill: #fff;
    fill-opacity: 1;
  }
  .TangentLine {
    stroke: #000;
    stroke-dasharray: 6px 4px;
    stroke-opacity: 1;
  }
  .TangentPoint {
    stroke: #000;
    fill: #fff;
    cursor: pointer;
  }
  .start {
    fill: red;
  }
  .end {
    fill: blue;
  }
</style>
