<script lang="ts">
  import Gleis from './Gleis.svelte';
  import { trackLibByArtNr } from './config/trackLib';
  import {
    gleisBezetz,
    GleisLink,
    gleisPlanned,
    LinkedRoute,
  } from './store/gleis';

  $: routes = Object.entries($gleisBezetz);

  function getBezetzSegment(
    currentLinkIndex: number,
    linkedRoute: LinkedRoute,
    id: string
  ) {
    const fromLink = linkedRoute[currentLinkIndex];
    const toLink = linkedRoute[currentLinkIndex + 1];

    const [, , fromPoint, from] = fromLink;
    const [, , toPoint, to] = toLink || [];

    console.log(id, `from ${from.type} --- to ${to?.type}`);

    const segment =
      from.pathSegments
        ?.filter(
          (pathSegment) =>
            (pathSegment.type === 'main' || pathSegment.type === 'branch') &&
            !!pathSegment.points?.length
        )
        ?.find((pathSegment) => {
          const noGo = !toPoint && pathSegment.points.includes(fromPoint);
          if (noGo) {
            console.log(linkedRoute[currentLinkIndex]);
          }
          return (
            (pathSegment.points.includes(fromPoint) &&
              pathSegment.points.includes(toPoint)) ||
            noGo
          );
        })
        ?.d.toString() || '';

    return segment;
  }

  function prevLinkTo(route, activeLinkIndex) {
    return route[activeLinkIndex - 1] && route[activeLinkIndex - 1][3];
  }
</script>

{#each routes as [id, { activeLinkIndex, route }]}
  {#if prevLinkTo(route, activeLinkIndex)}
    <Gleis
      gleisProps={prevLinkTo(route, activeLinkIndex)}
      proto={$trackLibByArtNr[prevLinkTo(route, activeLinkIndex).artnr]}
      bezetzSegment={getBezetzSegment(activeLinkIndex - 1, route, '1')}
    />
  {/if}
  <Gleis
    gleisProps={route[activeLinkIndex][3]}
    proto={$trackLibByArtNr[route[activeLinkIndex][3].artnr]}
    bezetzSegment={getBezetzSegment(activeLinkIndex, route, '2')}
  />
{/each}
