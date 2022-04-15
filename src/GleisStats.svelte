<script lang="ts">
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { calculateTrackLengthCM } from './helpers/geometry';
  import { gleisPlannedSelected } from './store/gleis';

  $: selectedGleisLengthTotal = Math.round(
    $gleisPlannedSelected
      .flatMap((gleis) =>
        calculateTrackLengthCM(
          gleis.pathSegments.find((segment) => segment.type === 'main')
        )
      )
      .reduce((acc, l) => acc + l, 0)
  );
</script>

<ControlMenuPanel title="Info">
  Length: {selectedGleisLengthTotal}cm
</ControlMenuPanel>
