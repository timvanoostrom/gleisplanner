<script lang="ts">
  import Button from './Button.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { editMode } from './store/workspace';
</script>

<ControlMenuPanel title="Editmode">
  <Button
    isActive={$editMode === 'gleis'}
    on:click={() => editMode.set('gleis')}>Gleis</Button
  >
  <Button
    isActive={$editMode === 'guides'}
    on:click={() => editMode.set('guides')}>Guides</Button
  >
  <Button
    isActive={$editMode === 'shapes'}
    on:click={() => editMode.set('shapes')}>Shapes</Button
  >
</ControlMenuPanel>
