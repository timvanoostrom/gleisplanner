<script lang="ts">
  import GuidePath from './GuidePath.svelte';
  import { layerControl } from './store/layerControl';
  import { baseGroup } from './store/plane';
  import {
    createGuide,
    guidesInLayer,
    guidesToolEnabled,
    dimensions,
    removeGuide,
    svgCoords,
    updateGuide,
  } from './store/workspace';
  import type { Point } from './types';

  let newPathPoints: Point[] = [];
  let selectedGuideIds = [];

  let pointsSelected = [];

  function points(points: Point[]) {
    return points.filter((point) => !!point);
  }

  function startOrFinishGuide(event: MouseEvent) {
    event.stopImmediatePropagation();
    if (!(event.target as SVGSVGElement).ownerSVGElement) {
      return;
    }
    const point = svgCoords(event, $baseGroup);
    if (newPathPoints.length === 0) {
      newPathPoints = [point, point];
    } else {
      const { id } = createGuide(
        $layerControl.activeLayerId,
        newPathPoints.slice(0, -2).map((p) => ({ x: p.x, y: p.y }))
      );
      newPathPoints = [];
      selectedGuideIds = [id];
    }
  }

  function moveEndPoint(event: MouseEvent) {
    if (!(event.target as SVGSVGElement).ownerSVGElement) {
      return;
    }
    if (newPathPoints.length >= 1) {
      if (newPathPoints.length > 1) {
        const point = svgCoords(event, $baseGroup);
        newPathPoints = [...newPathPoints.slice(0, -1), point];
      }
      // addPathPoint(event);
    }
  }

  function addPoint(event: MouseEvent) {
    if ((event.target as SVGSVGElement).ownerSVGElement) {
      const point = svgCoords(event, $baseGroup);
      if (newPathPoints.length >= 2) {
        newPathPoints = [...newPathPoints, point];
      }
    }
  }

  function startPath(point: Point) {
    newPathPoints = [point, point];
  }

  function closePath(point) {
    console.log('jap!');
    // Remove the mousepointer point
    newPathPoints.pop();

    const points = newPathPoints.map((p) => ({ x: p.x, y: p.y }));
    const { id } = createGuide($layerControl.activeLayerId, [...points, point]);

    newPathPoints = [];
    selectedGuideIds = [id];
  }

  function removeLastPoint() {
    newPathPoints.pop();
    newPathPoints = [...newPathPoints];
  }

  function selectGuide(event, id) {
    event.stopPropagation();
    if (selectedGuideIds.includes(id)) {
      selectedGuideIds = [];
      pointsSelected = [];
    } else {
      selectedGuideIds = [id];
    }
  }

  function onKeydownRouter(event) {
    if ($guidesToolEnabled) {
      switch (event.key) {
        case 'a':
        case 'A':
          if (event.metaKey && event.target.tagName !== 'INPUT') {
            event.preventDefault();
            // CMD + a selects  all guides  in active layer
            // CMD + Shift + A selects all guides in every layer
            let ids = $guidesInLayer
              .filter(
                (guide) =>
                  event.shiftKey ||
                  guide.layerId === $layerControl.activeLayerId
              )
              .map((guide) => guide.id);
            selectedGuideIds = ids;
          }
          break;
        case 'Backspace':
          event.preventDefault();
          event.stopImmediatePropagation();

          if (pointsSelected.length) {
            const guide = $guidesInLayer.find(
              (guide) => guide.id === selectedGuideIds[0]
            );
            if (guide) {
              const pointsUpdated = guide.points.filter(
                (point) => !pointsSelected.includes(point)
              );
              if (pointsUpdated.length <= 1) {
                removeGuide([selectedGuideIds[0]]);
                selectedGuideIds = [];
              } else {
                updateGuide({ ...guide, points: pointsUpdated });
              }
              pointsSelected = [];
            }
          } else {
            removeGuide(selectedGuideIds);
            selectedGuideIds = [];
          }

          break;
      }
      return;
    }
  }
</script>

<svelte:window
  on:keydown={onKeydownRouter}
  on:dblclick={(event) => startOrFinishGuide(event)}
  on:click={(event) => addPoint(event)}
  on:pointermove={(event) => moveEndPoint(event)}
/>

<rect
  class="GuidesPlane"
  x={-$dimensions.width / 2}
  y={-$dimensions.height / 2}
  width={$dimensions.width}
  height={$dimensions.height}
/>
<GuidePath
  on:pathPointClick={(event) => closePath(event.detail.point)}
  {pointsSelected}
  points={points(newPathPoints)}
  isTemp={true}
/>
{#each $guidesInLayer as guide}
  <GuidePath
    {pointsSelected}
    isSelected={selectedGuideIds.includes(guide.id)}
    on:pathPointClick={(event) => {
      if (event.detail.shiftKey) {
        pointsSelected = pointsSelected.includes(event.detail.point)
          ? pointsSelected.filter((point) => point !== event.detail.point)
          : [...pointsSelected, event.detail.point];
        if (!selectedGuideIds.length) {
          selectedGuideIds = [guide.id];
        }
      } else {
        newPathPoints.length
          ? closePath(event.detail.point)
          : startPath(event.detail.point);
      }
    }}
    on:click={(event) => selectGuide(event, guide.id)}
    points={points(guide.points)}
  />
{/each}

<style>
  .GuidesPlane {
    fill: #fff;
    fill-opacity: 0.4;
  }
</style>
