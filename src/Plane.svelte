<script lang="ts">
  import debounce from 'lodash.debounce';
  import { derived } from 'svelte/store';
  import { patternSelectedGleis } from './config/svg-fill-patterns';
  import GridLines from './GridLines.svelte';
  import { connectFlexPointStart } from './helpers/flex';
  import { baseGroupPoint, getTransform } from './helpers/svg';
  import {
    connectGleis,
    deleteGleisActive,
    getRootPointOrigin,
    gleisPlanned,
    protoGleisActive,
    setGleisIdsActive,
  } from './store/gleis';
  import {
    layerControl,
    layerPatterns,
    layersById,
  } from './store/layerControl';
  import { availableSpaceElement, baseGroup, planeSvg } from './store/plane';
  import {
    dimensions,
    isGridVisible,
    scale,
    setViewBoxTranslation,
    svgCoords,
    viewBoxTranslation,
  } from './store/workspace';
  import type { Point, PointDimensions } from './types';

  const viewBoxTranslationInitial = $viewBoxTranslation;

  let isDragActive: boolean = false;
  let dragDelta = { y: 0, x: 0 };
  let svg: SVGSVGElement;
  let anchorPoint;

  planeSvg.subscribe((svgElement) => (svg = svgElement));

  const transform = derived(scale, (scale) => {
    const base = $baseGroup;

    if (!base) {
      return `scale(${scale})`;
    }

    const attr = getTransform(base.transform.baseVal);

    attr.scale.value = scale;

    const attrString = Object.values(attr)
      .map((attr) => attr.s)
      .join(' ');

    return attrString;
  });

  const saveViewboxTranslation = debounce((x: number, y: number) => {
    setViewBoxTranslation((translation) => {
      if (translation === null) {
        return viewBoxTranslationInitial;
      }
      return {
        x,
        y,
      };
    });
  }, 100);

  function shiftViewBox(deltaX: number, deltaY: number) {
    svg.viewBox.baseVal.x += deltaX;
    svg.viewBox.baseVal.y += deltaY;
    saveViewboxTranslation(svg.viewBox.baseVal.x, svg.viewBox.baseVal.y);
  }

  let dragSelectAnchor: Point = null;
  let dragSelectArea: PointDimensions = null;

  function startDragSelect(event) {
    if (event.metaKey) {
      event.stopPropagation();
      const { x, y } = svgCoords(event, $baseGroup as SVGGeometryElement);
      dragSelectAnchor = {
        x,
        y,
      };
      dragSelectArea = {
        x,
        y,
        width: 10,
        height: 10,
      };
    }
  }

  function doDragSelect(event) {
    if (event.metaKey && dragSelectAnchor) {
      event.stopPropagation();
      const { x, y } = svgCoords(event, $baseGroup as SVGGeometryElement);
      if (x > dragSelectAnchor.x && y > dragSelectAnchor.y) {
        dragSelectArea.width = x - dragSelectAnchor.x;
        dragSelectArea.height = y - dragSelectAnchor.y;
      } else if (x > dragSelectAnchor.x && y < dragSelectAnchor.y) {
        dragSelectArea.width = x - dragSelectAnchor.x;
        dragSelectArea.height = dragSelectAnchor.y - y;
        dragSelectArea.y = y;
      } else if (x < dragSelectAnchor.x && y < dragSelectAnchor.y) {
        dragSelectArea.x = x;
        dragSelectArea.y = y;
        dragSelectArea.width = dragSelectAnchor.x - x;
        dragSelectArea.height = dragSelectAnchor.y - y;
      } else if (x < dragSelectAnchor.x && y > dragSelectAnchor.y) {
        dragSelectArea.x = x;
        // dragSelectArea.y = y;
        dragSelectArea.width = dragSelectAnchor.x - x;
        dragSelectArea.height = y - dragSelectAnchor.y;
      }
    }
  }

  function endDragSelect(event) {
    event.stopPropagation();
    const isWithinSelection = (a: Point, b: PointDimensions) => {
      return (
        a.x >= b.x &&
        a.x <= b.x + b.width &&
        a.y >= b.y &&
        a.y <= b.y + b.height
      );
    };
    const gleisIdsInSelection = Object.values($gleisPlanned)
      .filter((gleis) => gleis.layerId === $layerControl.activeLayerId)
      .filter((gleis) => {
        return gleis.points
          .filter((p) => p.type !== 'cc')
          .some((point) => {
            return isWithinSelection(point, dragSelectArea);
          });
      })
      .map((gleis) => gleis.id);

    setGleisIdsActive((gleisIdsSelected) => {
      if (event.shiftKey) {
        return Array.from(
          new Set([...gleisIdsSelected, ...gleisIdsInSelection])
        );
      }
      return gleisIdsInSelection;
    });
    dragSelectAnchor = null;
    dragSelectArea = null;
  }

  const startDragTranslate = (event) => {
    if (event.currentTarget === svg) {
      isDragActive = true;
      dragDelta = { y: 0, x: 0 };
      anchorPoint = svgCoords(event, svg);
    }
  };

  const doDragTranslate = (event: MouseEvent) => {
    if (isDragActive) {
      const targetPoint = svgCoords(event, svg);
      dragDelta = {
        x: anchorPoint.x - targetPoint.x,
        y: anchorPoint.y - targetPoint.y,
      };
      shiftViewBox(
        anchorPoint.x - targetPoint.x,
        anchorPoint.y - targetPoint.y
      );
    }
  };

  const endDragTranslate = (event) => {
    if (isDragActive) {
      event.stopPropagation();
      isDragActive = false;
    }
  };

  const startDrag = (event) => {
    if (event.metaKey) {
      startDragSelect(event);
    } else {
      startDragTranslate(event);
    }
  };

  const doDrag = (event: MouseEvent) => {
    if (event.metaKey) {
      doDragSelect(event);
    } else {
      doDragTranslate(event);
    }
  };

  const endDrag = (event) => {
    if (event.metaKey) {
      endDragSelect(event);
    } else {
      endDragTranslate(event);
    }
  };

  const onAddGleis = (event) => {
    const { x, y } = baseGroupPoint(
      $planeSvg,
      $baseGroup,
      $baseGroup as SVGGeometryElement,
      {
        x: event.clientX,
        y: event.clientY,
      }
    );

    if ($protoGleisActive.type === 'Flex') {
      if (!$connectFlexPointStart) {
        connectFlexPointStart.set(getRootPointOrigin(x, y));
        event.stopPropagation();
      }
    } else {
      connectGleis({
        pointOrigin: getRootPointOrigin(x, y),
      });
    }
  };

  function onKeyDownRouter(event) {
    switch (true) {
      case event.key === 'Backspace' && event.target.tagName !== 'INPUT':
        event.preventDefault();
        deleteGleisActive();
        break;
      case event.key.toLowerCase() === 'a' &&
        event.metaKey &&
        event.target.tagName !== 'INPUT':
        event.preventDefault();
        // CMD + a selects  all gleis  in active layer
        // CMD + Shift + A selects all gleis in every layer
        let ids = event.shiftKey
          ? Object.values($gleisPlanned)
              .filter((gleis) => {
                const layer = $layersById[gleis.layerId];
                if (!layer) {
                  console.log('layer does not exist', gleis.layerId);
                  return;
                }
                return !layer.locked && layer.isVisible;
              })
              .map((gleis) => gleis.id)
          : Object.values($gleisPlanned)
              .filter((gleis) => gleis.layerId === $layerControl.activeLayerId)
              .map((gleis) => gleis.id);
        setGleisIdsActive(ids);
        break;

      default:
        break;
    }
  }

  function onDeselect(event) {
    if (dragDelta.x === 0 && dragDelta.y === 0 && !dragSelectAnchor) {
      setGleisIdsActive([]);
    }
  }
</script>

<svelte:window on:keydown={onKeyDownRouter} />

<div id="gleis-plane" class="Plane">
  <svg
    bind:this={$planeSvg}
    id="gleis-svg"
    viewBox={`${$viewBoxTranslation.x} ${$viewBoxTranslation.y} ${
      $dimensions.width / 2
    } ${$dimensions.height / 2}`}
    on:pointerdown={startDrag}
    on:pointermove={doDrag}
    on:pointerup={endDrag}
  >
    <defs>
      {#each $layerPatterns as pattern}
        <g>{@html pattern}</g>
      {/each}
      <g>{@html patternSelectedGleis}</g>
    </defs>
    <g
      bind:this={$baseGroup}
      id="gleis-base-group"
      class="ScaleSpace"
      transform={$transform}
      on:dblclick={(event) => onAddGleis(event)}
    >
      <rect
        bind:this={$availableSpaceElement}
        class="AvailableSpace"
        x={-$dimensions.width / 2}
        y={-$dimensions.height / 2}
        width={$dimensions.width}
        height={$dimensions.height}
        on:pointerup={(event) => onDeselect(event)}
      />

      {#if $isGridVisible}<GridLines />{/if}

      <circle r={10} fill="blue" cx={0} cy={0} />
      <slot />
      {#if dragSelectArea !== null}
        <rect
          x={dragSelectArea.x}
          y={dragSelectArea.y}
          width={dragSelectArea.width}
          height={dragSelectArea.height}
          class="DragSelectArea"
        />
      {/if}
    </g>
  </svg>
</div>

<style>
  #gleis-svg {
    height: 100%;
    width: 100%;
  }

  .Plane {
    background-color: #555;
    overflow: hidden;
    position: relative;
    height: calc(100vh - 90px);
    width: 100%;
  }

  .AvailableSpace {
    fill: #fff;
    outline: 10px solid goldenrod;
  }

  .ScaleSpace {
  }

  .DragSelectArea {
    fill: none;
    stroke: #000;
    stroke-width: 1px;
    stroke-dasharray: 4px 8px;
  }
</style>
