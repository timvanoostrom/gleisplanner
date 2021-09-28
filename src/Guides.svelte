<script lang="ts">
  import GuidePath from './GuidePath.svelte';
  import { layerControl } from './store/layerControl';
  import {
    createGuide,
    guidesInLayer,
    removeGuide,
    svgCoords,
    updateGuide,
  } from './store/workspace';
  import type { Point } from './types';

  // let newPathPoints: Point[] = [];
  // let guideGroup;
  // let selectedGuideIds = [];

  // function points(points: Point[]) {
  //   return points.filter((point) => !!point);
  // }

  // function startOrFinishGuide(event: MouseEvent) {
  //   if (!event.target.ownerSVGElement) {
  //     return;
  //   }
  //   const point = svgCoords(event, guideGroup);
  //   if (newPathPoints.length === 0) {
  //     newPathPoints = [point, point];
  //   } else {
  //     const { id } = createGuide(
  //       $layerControl.activeLayerId,
  //       newPathPoints.slice(0, -2).map((p) => ({ x: p.x, y: p.y }))
  //     );
  //     newPathPoints = [];
  //     selectedGuideIds = [id];
  //   }
  // }

  // function moveEndPoint(event: MouseEvent) {
  //   if (!event.target.ownerSVGElement) {
  //     return;
  //   }
  //   if (newPathPoints.length >= 1) {
  //     if (newPathPoints.length > 1) {
  //       const point = svgCoords(event, guideGroup);
  //       newPathPoints = [...newPathPoints.slice(0, -1), point];
  //     }
  //     // addPathPoint(event);
  //   }
  // }

  // function addPoint(event: MouseEvent) {
  //   console.log('addp');
  //   if (event.target?.ownerSVGElement) {
  //     const point = svgCoords(event, guideGroup);
  //     if (newPathPoints.length >= 2) {
  //       newPathPoints = [...newPathPoints, point];
  //     }
  //   }
  // }

  // function startPath(point: Point) {
  //   newPathPoints = [point, point];
  // }

  // function closePath(point) {
  //   console.log('jap!');
  //   // Remove the mousepointer point
  //   newPathPoints.pop();

  //   if ($editMode === 'shapes') {
  //     const points = newPathPoints.map((p) => ({ x: p.x, y: p.y }));
  //     const { id } = createGuide(
  //       $layerControl.activeLayerId,
  //       [...points, points[0]],
  //       true
  //     );

  //     newPathPoints = [];
  //     selectedGuideIds = [id];
  //   } else {
  //     const points = newPathPoints.map((p) => ({ x: p.x, y: p.y }));
  //     const { id } = createGuide(
  //       $layerControl.activeLayerId,
  //       [...points, point],
  //       false
  //     );

  //     newPathPoints = [];
  //     selectedGuideIds = [id];
  //   }
  // }

  // function removeLastPoint() {
  //   newPathPoints.pop();
  //   newPathPoints = [...newPathPoints];
  // }

  // function selectGuide(event, id) {
  //   event.stopPropagation();
  //   if (selectedGuideIds.includes(id)) {
  //     selectedGuideIds = [];
  //   } else {
  //     selectedGuideIds = [id];
  //   }
  // }

  // function onKeydownRouter(event) {
  //   if (isActive) {
  //     switch (event.key) {
  //       case 'a':
  //       case 'A':
  //         if (event.metaKey && event.target.tagName !== 'INPUT') {
  //           event.preventDefault();
  //           // CMD + a selects  all guides  in active layer
  //           // CMD + Shift + A selects all guides in every layer
  //           let ids = $guidesInLayer
  //             .filter(
  //               (guide) =>
  //                 event.shiftKey ||
  //                 guide.layerId === $layerControl.activeLayerId
  //             )
  //             .map((guide) => guide.id);
  //           selectedGuideIds = ids;
  //         }
  //         break;
  //       case 'Backspace':
  //         event.preventDefault();
  //         event.stopImmediatePropagation();

  //         if (selectedGuideIds.length > 1) {
  //           removeGuide(selectedGuideIds);
  //           selectedGuideIds = [];
  //         } else if (selectedGuideIds.length === 1) {
  //           const guide = $guidesInLayer.find(
  //             (guide) => guide.id === selectedGuideIds[0]
  //           );
  //           if (guide) {
  //             const pointsUpdated = guide.points.slice(0, -1);
  //             if (pointsUpdated.length === 1) {
  //               removeGuide(selectedGuideIds);
  //               selectedGuideIds = [];
  //             } else {
  //               console.log('pointsUpdated', pointsUpdated);
  //               updateGuide({ ...guide, points: pointsUpdated });
  //             }
  //           }
  //         } else if (newPathPoints.length) {
  //           removeLastPoint();
  //         }
  //         break;
  //     }
  //     return;
  //   }
  // }
</script>

<!-- 
<svelte:window
  on:keydown={onKeydownRouter}
  on:dblclick={(event) => startOrFinishGuide(event)}
  on:click={(event) => addPoint(event)}
  on:pointermove={(event) => moveEndPoint(event)}
/>

<g class="Guides" bind:this={guideGroup}>
  {#if isActive}
    <GuidePath
      isShape={$editMode === 'shapes'}
      on:pathPointClick={(event) => closePath(event.detail)}
      points={points(newPathPoints)}
      isTemp={true}
    />
    {#each $guidesInLayer as guide}
      <GuidePath
        isShape={guide.isShape}
        isSelected={selectedGuideIds.includes(guide.id)}
        on:pathPointClick={(event) =>
          newPathPoints.length
            ? closePath(event.detail)
            : startPath(event.detail)}
        on:click={(event) => selectGuide(event, guide.id)}
        points={points(guide.points)}
      />
    {/each}
  {:else}
    {#each $guidesInLayer as guide}
      <GuidePath isShape={guide.isShape} points={points(guide.points)} />
    {/each}
  {/if}
</g> -->
