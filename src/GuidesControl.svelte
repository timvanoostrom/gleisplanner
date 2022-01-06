<script lang="ts">
  import GuideRect from './GuideRect.svelte';

  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import Dialog from './Dialog.svelte';
  import GuidePath from './GuidePath.svelte';
  import { guideStyles, round } from './helpers/app';
  import { layerControl } from './store/layerControl';
  import { baseGroup } from './store/plane';
  import {
    activeGuide,
    createGuide,
    dimensions,
    fillDialogActive,
    guidesInLayer,
    guidesToolEnabled,
    guidesToolShapeType,
    removeGuide,
    selectedGuideId,
    svgCoords,
    updateGuide,
  } from './store/workspace';
  import type { Guide, Point } from './types';
  import * as AColorPicker from 'a-color-picker';
  import Button from './Button.svelte';

  const DEFAULT_FILL = 'rgba(255, 130, 130, 1)';

  let newPathPoints: Point[] = [];
  let pointsSelected = [];
  let activeGuideColor = DEFAULT_FILL;

  function startOrFinishGuide(event: MouseEvent) {
    event.stopImmediatePropagation();
    if (!(event.target as SVGSVGElement).ownerSVGElement) {
      return;
    }
    const point = svgCoords(event, $baseGroup);
    if (newPathPoints.length === 0) {
      newPathPoints = [point, point];
    } else {
      const { id } = createGuide({
        layerId: $layerControl.activeLayerId,
        points: newPathPoints.slice(0, -2).map((p) => ({ x: p.x, y: p.y })),
      });
      newPathPoints = [];
      selectedGuideId.set(id);
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

  function continuePath(guide: Guide, point: Point) {
    const pIndex = guide.points.findIndex((p) => p === point);

    if (pIndex !== -1) {
      newPathPoints =
        pIndex === 0
          ? [...guide.points].reverse().concat(point)
          : [...guide.points, point];
      selectedGuideId.set(guide.id);
    } else {
      startPath(point);
    }
  }

  function closePath(point) {
    console.log('jap!');
    // Remove the mousepointer point
    newPathPoints.pop();
    newPathPoints = newPathPoints.concat(point);

    if ($selectedGuideId) {
      updateGuide({ ...$activeGuide, points: newPathPoints });
    } else {
      const { id } = createGuide({
        layerId: $layerControl.activeLayerId,
        points: newPathPoints,
      });
      selectedGuideId.set(id);
    }

    newPathPoints = [];
  }

  function removeLastPoint() {
    newPathPoints.pop();
    newPathPoints = [...newPathPoints];
  }

  function selectGuide(event, id) {
    event.stopPropagation();
    if ($selectedGuideId === id) {
      selectedGuideId.set(null);
      pointsSelected = [];
    } else {
      selectedGuideId.set(id);
    }
  }

  function onKeydownRouter(event) {
    if ($guidesToolEnabled) {
      switch (event.key) {
        // case 'a':
        // case 'A':
        //   if (event.metaKey && event.target.tagName !== 'INPUT') {
        //     event.preventDefault();
        //     // CMD + a selects  all guides  in active layer
        //     // CMD + Shift + A selects all guides in every layer
        //     let ids = $guidesInLayer
        //       .filter(
        //         (guide) =>
        //           event.shiftKey ||
        //           guide.layerId === $layerControl.activeLayerId
        //       )
        //       .map((guide) => guide.id);
        //     selectedGuideId.set(ids);
        //   }
        //   break;
        case 'Backspace':
          event.preventDefault();
          event.stopImmediatePropagation();

          if ($guidesToolShapeType !== 'line') {
            if ($selectedGuideId) {
              removeGuide([$selectedGuideId]);
              selectedGuideId.set(null);
            }
            return;
          }
          console.log('pointsSelected.length', pointsSelected.length);
          if (pointsSelected.length) {
            const guide = $guidesInLayer.find(
              (guide) =>
                guide.id === $selectedGuideId ||
                guide.points.some((point) => pointsSelected.includes(point))
            );
            if (guide) {
              const pointsUpdated = guide.points.filter(
                (point) => !pointsSelected.includes(point)
              );
              if (pointsUpdated.length <= 1) {
                removeGuide([$selectedGuideId]);
                selectedGuideId.set(null);
              } else {
                updateGuide({ ...guide, points: pointsUpdated });
              }
              pointsSelected = [];
            }
          } else {
            removeGuide($selectedGuideId);
            selectedGuideId.set(null);
          }

          break;
      }
      return;
    }
  }

  $: shape = null;

  function startOrFinishShape(event: MouseEvent) {
    event.stopPropagation();
    if (!shape) {
      const point = svgCoords(event, $baseGroup);
      shape = {
        x: point.x,
        y: point.y,
        points: [
          {
            x: point.x,
            y: point.y,
          },
        ],
      };
    } else {
      const { id } = createGuide({
        layerId: $layerControl.activeLayerId,
        points: [{ x: shape.x, y: shape.y }],
        width: shape.width,
        height: shape.height,
        transform: shape.transform,
      });
      shape = null;
      selectedGuideId.set(id);
    }
  }

  function drawShape(event: PointerEvent) {
    if (shape) {
      const point = svgCoords(event, $baseGroup);
      shape.width = point.x - shape.x;
      shape.height = point.y - shape.y;

      let tx = 0;
      let ty = 0;

      if (point.x <= shape.x) {
        tx = shape.width;
      }

      if (point.y <= shape.y) {
        ty = shape.height;
      }

      shape.width = Math.abs(shape.width);
      shape.height = Math.abs(shape.height);
      shape.transform = `translate(${tx} ${ty})`;
    }
  }

  function selectShape(id: Guide['id']) {
    selectedGuideId.update((xid) => {
      if (xid === id) {
        return null;
      }
      return id;
    });
  }

  function moveShape() {
    if (selectedGuideId) {
    }
  }

  function setGuideStyle(styles) {
    if ($activeGuide) {
      updateGuide({
        ...$activeGuide,
        style: { ...($activeGuide.style || {}), ...styles },
      });
    }
  }

  $: tempGuide = newPathPoints.length
    ? ({ points: newPathPoints } as Guide)
    : null;

  function onPathPointClick(event, guide) {
    if (event.detail.shiftKey) {
      pointsSelected = pointsSelected.includes(event.detail.point)
        ? pointsSelected.filter((point) => point !== event.detail.point)
        : [...pointsSelected, event.detail.point];
      if (!selectedGuideId) {
        selectedGuideId.set(guide.id);
      }
    } else {
      newPathPoints.length
        ? closePath(event.detail.point)
        : continuePath(guide, event.detail.point);
    }
  }

  $: console.log('$guidesInLayer:', $guidesInLayer);
</script>

<svelte:window
  on:keydown={onKeydownRouter}
  on:dblclick={(event) =>
    $guidesToolShapeType !== 'line'
      ? startOrFinishShape(event)
      : startOrFinishGuide(event)}
  on:click={(event) => addPoint(event)}
  on:pointermove={(event) =>
    $guidesToolShapeType !== 'line' ? drawShape(event) : moveEndPoint(event)}
/>

<rect
  class="GuidesPlane"
  x={-$dimensions.width / 2}
  y={-$dimensions.height / 2}
  width={$dimensions.width}
  height={$dimensions.height}
/>
{#if tempGuide}
  <GuidePath
    on:pathPointClick={(event) => closePath(event.detail.point)}
    {pointsSelected}
    guide={tempGuide}
    isTemp={true}
  />
{/if}
{#if shape}
  <GuideRect guide={shape} />
{/if}
{#each $guidesInLayer as guide}
  {#if guide.type === 'rect'}
    <GuideRect {guide} on:click={() => selectShape(guide.id)} />
  {:else}
    <GuidePath
      {guide}
      {pointsSelected}
      on:pathPointClick={(event) => onPathPointClick(event, guide)}
      on:click={(event) => selectGuide(event, guide.id)}
    />
  {/if}
{/each}

{#if $fillDialogActive}
  <Dialog
    id="ColorPickerDialog"
    height="auto"
    width="260px"
    isOpen={true}
    on:close={() => {
      fillDialogActive.set(false);
    }}
    on:created={() => {
      activeGuideColor = $activeGuide?.style?.fill || activeGuideColor;
      const [picker] = AColorPicker.from('[data-color-picker]', {
        showHSL: false,
        showRGB: false,
        showHEX: false,
        showAlpha: true,
        color: activeGuideColor,
      });
      picker.on('change', (picker, color) => {
        setGuideStyle({
          fill: color,
        });
      });
    }}
  >
    <div class="DialogContent">
      <ControlMenuPanel flex={false} title={'Select Color'}>
        <div data-color-picker />
      </ControlMenuPanel>
      <footer class="DialogFooter">
        <Button
          on:click={() => {
            fillDialogActive.set(false);
          }}
        >
          Ok
        </Button>
        <Button
          variant="plain"
          on:click={() => {
            setGuideStyle({
              fill: activeGuideColor,
            });
            fillDialogActive.set(false);
          }}
        >
          Cancel
        </Button>
      </footer>
    </div>
  </Dialog>
{/if}

<style>
  .DialogContent {
    display: flex;
    height: 100%;
    align-items: center;
    align-content: center;
    flex-direction: column;
  }
  .GuidesPlane {
    fill: #fff;
    fill-opacity: 0.4;
  }
  .GuideShape {
    fill: rgba(255, 130, 130, 1);
  }
  .SizeLabel {
    font-size: 10px;
  }
  .isSelected {
    stroke: red;
    stroke-width: 5px;
    stroke-opacity: 0.7;
  }
</style>
