<script lang="ts">
  import { trackLibByArtNr } from './config/trackLib';
  import Gleis from './Gleis.svelte';
  import { convertToPoint, findSegment } from './helpers/gleis';
  import {
    gleisBezetz,
    gleisIdsActive,
    LinkedRoute,
    setGleisIdActive,
  } from './store/gleis';
  import Loco from './Loco.svelte';
  import type { Point } from './types';
  import { planeSvg } from './store/plane';

  $: activeRoute = $gleisBezetz.routes[$gleisBezetz.activeRouteId];

  function getBezetzSegment(
    currentLinkIndex: number,
    linkedRoute: LinkedRoute
  ) {
    const fromLink = linkedRoute[currentLinkIndex];
    const toLink = linkedRoute[currentLinkIndex + 1];

    const [, , fromPoint, from] = fromLink;
    const [, , toPoint, to] = toLink || [];

    return findSegment(from, fromPoint, toPoint);
  }

  function prevLinkTo(route, activeLinkIndex) {
    return route[activeLinkIndex - 1] && route[activeLinkIndex - 1][3];
  }

  function calculatePathDuration(length: number) {
    return '20s';
  }

  const svgPoint = $planeSvg.createSVGPoint();

  let fromIndex = 0;
  let i = 0;

  function detectGleis(p: CustomEvent<Point>) {
    // const { x, y } = convertToPoint(p.detail);
    // const el = document.elementFromPoint(p.detail.x, p.detail.y);
    // console.log('el',el)
    i = 0;
    for (const link of $gleisBezetz.routes[
      $gleisBezetz.activeRouteId
    ].route.links.slice(fromIndex)) {
      const to = link[3];

      svgPoint.x = p.detail.x;
      svgPoint.y = p.detail.y;

      const paths = Array.from(
        document.querySelectorAll(`#${to.id} .spath.main`)
      );

      const isDetected = paths.some((el: SVGPathElement) =>
        el.isPointInStroke(svgPoint)
      );

      if (isDetected && !$gleisIdsActive.includes(to.id)) {
        fromIndex = i;
        setGleisIdActive(to.id);
      }
      if (isDetected) {
        break;
      }

      i += 1;
    }
  }
</script>

{#if activeRoute}
  {#if prevLinkTo(activeRoute.route.links, activeRoute.activeLinkIndex)}
    <Gleis
      gleisProps={prevLinkTo(
        activeRoute.route.links,
        activeRoute.activeLinkIndex
      )}
      proto={$trackLibByArtNr[
        prevLinkTo(activeRoute.route.links, activeRoute.activeLinkIndex).artnr
      ]}
      bezetzSegment={getBezetzSegment(
        activeRoute.activeLinkIndex - 1,
        activeRoute.route.links
      )}
    />
  {/if}
  <Gleis
    gleisProps={activeRoute.route.links[activeRoute.activeLinkIndex][3]}
    proto={$trackLibByArtNr[
      activeRoute.route.links[activeRoute.activeLinkIndex][3].artnr
    ]}
    bezetzSegment={getBezetzSegment(
      activeRoute.activeLinkIndex,
      activeRoute.route.links
    )}
  />
  {#if $gleisBezetz?.routes[$gleisBezetz.activeRouteId]}
    <Loco
      on:pointAt={detectGleis}
      path={$gleisBezetz.routes[$gleisBezetz.activeRouteId].route.path}
    />
  {/if}
  <!-- {#if activeRoute.route.path}
    <circle r="25" fill="red">
      <animateMotion
        dur={calculatePathDuration(activeRoute.route.length)}
        repeatCount="indefinite"
        path={activeRoute.route.path}
      />
    </circle>
  {/if} -->
{/if}
