<script lang="ts">
  import Gleis from './Gleis.svelte';
  import { trackLibByArtNr } from './config/trackLib';
  import { gleisBezetz } from './store/gleis';

  $: bezetzCombos = Object.entries($gleisBezetz);

  function getBezetzSegment(
    id,
    curPoint,
    curGleis,
    curConnectionType,
    nextPoint,
    nextGleis,
    nextConnectionType
  ) {
    const segment =
      curGleis.pathSegments
        ?.filter(
          (pathSegment) =>
            (pathSegment.type === 'main' || pathSegment.type === 'branch') &&
            !!pathSegment.points?.length
        )
        ?.find((pathSegment) => {
          return (
            (pathSegment.points.includes(curPoint) &&
              pathSegment.points.includes(nextPoint)) ||
            (!nextPoint && pathSegment.points.includes(curPoint))
          );
        })?.gleisType || '';

    return segment;
  }
</script>

{#each bezetzCombos as [id, [curPoint, curGleis, curConnectionType, nextPoint, nextGleis, nextConnectionType]]}
  <Gleis
    gleisProps={curGleis}
    proto={$trackLibByArtNr[curGleis.artnr]}
    bezetzSegment={getBezetzSegment(
      id,
      curPoint,
      curGleis,
      curConnectionType,
      nextPoint,
      nextGleis,
      nextConnectionType
    )}
  />
{/each}
