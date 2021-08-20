<script lang="ts">
  import type { IconName } from './lib/far-icons';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';

  export let name: IconName;
  export let size: number = 16;
  export let color: string = '#000000';
</script>

<Button variant="plain" on:click>
  <Icon {color} {name} {size} />
</Button>
