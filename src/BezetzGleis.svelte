<script lang="ts">
  import Gleis from './Gleis.svelte';
  import { trackLibByArtNr } from './config/trackLib';
  import { gleisBezetz } from './store/gleis';

  $: bezetzCombos = Object.entries($gleisBezetz);
  $: console.log('bezetzCombos:', bezetzCombos);
</script>

{#each bezetzCombos as [id, combo]}
  <Gleis
    gleisProps={combo[1]}
    proto={$trackLibByArtNr[combo[1].artnr]}
    bezetzSegment={combo[1].pathSegments.find(
      (pathSegment) => pathSegment.type === 'main'
    ).gleisType || ''}
  />
{/each}
