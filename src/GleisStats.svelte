<script lang="ts">
  import { tick } from 'svelte';
  import { svgPathProperties } from 'svg-path-properties';

  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { gleisPlannedSelected } from './store/gleis';

  function getGleisSelectedLengthTotal(gleisPlannedSelected) {
    const g = document.getElementById('selected-gleis');
    if (g) {
      const paths = Array.from(g.querySelectorAll('.spath.main'));
      return paths
        .map((el) => {
          const l = new svgPathProperties(
            el.getAttribute('d')
          ).getTotalLength();
          return l || 0;
        })
        .reduce((acc, l) => acc + l, 0);
    }
    return 0;
  }

  $: selectedGleisLengthTotal = 0;

  gleisPlannedSelected.subscribe(async (gleisPlannedSelected) => {
    await tick();
    selectedGleisLengthTotal = Math.round(
      getGleisSelectedLengthTotal(gleisPlannedSelected) / 10
    );
  });
</script>

<ControlMenuPanel title="Info">
  Length: {selectedGleisLengthTotal}cm
</ControlMenuPanel>
