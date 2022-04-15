<script lang="ts">
  import Gleis from './Gleis.svelte';
  import { trackLibByArtNr } from './config/trackLib';
  import {
    gleisBezetz,
    GleisLink,
    gleisPlanned,
    LinkedRoute,
  } from './store/gleis';

  $: console.log($gleisBezetz);

  function getBezetzSegment(
    currentLinkIndex: number,
    linkedRoute: LinkedRoute
  ) {
    const [, , fromPoint, currentGleis] = linkedRoute[currentLinkIndex];
    const [, , toPoint] = linkedRoute[currentLinkIndex + 1] || [];

    const segment =
      currentGleis.pathSegments
        ?.filter(
          (pathSegment) =>
            (pathSegment.type === 'main' || pathSegment.type === 'branch') &&
            !!pathSegment.points?.length
        )
        ?.find((pathSegment) => {
          return (
            (pathSegment.points.includes(fromPoint) &&
              pathSegment.points.includes(toPoint)) ||
            (!toPoint && pathSegment.points.includes(fromPoint))
          );
        })
        ?.d.toString() || '';

    return segment;
  }
</script>

{#each $gleisBezetz as linkedRoute}
  {#each linkedRoute as [fromPoint, fromGleis, toPoint, toGleis], index}
    <Gleis
      gleisProps={toGleis}
      proto={$trackLibByArtNr[toGleis.artnr]}
      bezetzSegment={getBezetzSegment(index, linkedRoute)}
    />
  {/each}
{/each}
