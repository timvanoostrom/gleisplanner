<script lang="ts">
  import { shortCircuitConnections } from './store/gleis';

  const connections = shortCircuitConnections();
</script>

<g>
  {#each $connections as point}
    <circle
      r="30"
      fill="none"
      stroke="red"
      stroke-width="4"
      cx={point.x}
      cy={point.y}
    />
  {/each}
</g>
