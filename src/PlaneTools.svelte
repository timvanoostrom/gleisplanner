<script lang="ts">
  import { connectFlexPointStart } from './helpers/flex';
  import { baseGroupPoint } from './helpers/svg';
  import {
    connectGleis,
    deleteGleisActive,
    getRootPointOrigin,
    gleisPlanned,
    protoGleisActive,
    setGleisIdsActive,
  } from './store/gleis';
  import { layerControl, layersById } from './store/layerControl';
  import { availableSpaceElement, baseGroup, planeSvg } from './store/plane';
  import { svgCoords } from './store/workspace';
  import type { Point, PointDimensions } from './types';

  let dragDelta = { y: 0, x: 0 };
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

  const startDrag = (event) => {
    if (event.metaKey) {
      startDragSelect(event);
    }
  };

  const doDrag = (event: MouseEvent) => {
    if (event.metaKey) {
      doDragSelect(event);
    }
  };

  const endDrag = (event) => {
    if (event.metaKey) {
      endDragSelect(event);
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
    if (event.target === $availableSpaceElement) {
      setGleisIdsActive([]);
    }
  }
</script>

<svelte:window
  on:keydown={onKeyDownRouter}
  on:dblclick={(event) => onAddGleis(event)}
  on:pointerup={(event) => {
    endDrag(event);
    onDeselect(event);
  }}
  on:pointerdown={startDrag}
  on:pointermove={doDrag}
/>

{#if dragSelectArea !== null}
  <rect
    x={dragSelectArea.x}
    y={dragSelectArea.y}
    width={dragSelectArea.width}
    height={dragSelectArea.height}
    class="DragSelectArea"
  />
{/if}

<style>
  .DragSelectArea {
    fill: none;
    stroke: #000;
    stroke-width: 1px;
    stroke-dasharray: 4px 8px;
  }
</style>
