<script lang="ts">
  import Button from './Button.svelte';

  export let title = '';
  export let dropdown: boolean = false;
  export let flex: boolean = true;
  export let toggle: boolean = false;
  export let startMinimized: boolean = false;

  let isOpen = false;
  $: isMinimized = startMinimized;

  function showMenu() {
    isOpen = true;
  }

  function hideMenu() {
    isOpen = false;
  }
  $: toggleSymbol = isMinimized ? '+' : '-';
</script>

<div
  class="ControlMenuPanel"
  class:dropdown
  class:isOpen
  class:flex
  on:mouseenter={showMenu}
  on:mouseleave={hideMenu}
>
  {#if title}
    <header>
      {#if toggle}
        <Button
          className="toggle"
          variant="plain"
          on:click={() => (isMinimized = !isMinimized)}
        >
          {@html toggleSymbol}
        </Button>
      {/if}
      <h4>
        {#if dropdown}
          <Button variant="plain">{title}</Button>
        {:else}
          {title}
        {/if}
      </h4>
      <div class="header-right">
        <slot name="header-right" />
      </div>
    </header>
  {/if}
  {#if !isMinimized}
    <div class="PanelContent">
      {#if dropdown}
        <div class="DropdownPanel">
          <slot />
        </div>
      {:else}
        <slot />
      {/if}
    </div>
  {/if}
</div>

<style>
  header {
    display: flex;
    justify-content: left;
    align-items: center;
  }
  .header-right {
    justify-self: right;
  }
  .ControlMenuPanel {
    position: relative;
    align-items: center;

    --ControlMenuPanel-DropdownPanel-border-color: #000;
    --ControlMenuPanel-DropdownPanel-border-width: 1px;
  }
  .PanelContent {
    max-height: 400px;
    overflow-y: scroll;
  }
  .flex {
    display: var(--ControlMenuPanel-display, flex);
  }
  h4 {
    margin: 0 10px 0 0;
    /* z-index: 9; */
    background-color: #fff;
    position: relative;
  }

  .dropdown h4 {
    margin: 0;
    border: var(--ControlMenuPanel-DropdownPanel-border-width) solid transparent;
    padding: 2px 10px 5px 10px;
    border-radius: 3px 3px 0 0;
  }
  .dropdown.isOpen h4 {
    border-bottom: 0;
    z-index: 11;
    border-color: var(--ControlMenuPanel-DropdownPanel-border-color);
  }
  .DropdownPanel {
    opacity: 0;
    height: 0;
    width: 0;
    overflow: hidden;
    transition: opacity 100 ease-in-out;
    position: absolute;
    min-width: 160px;
    max-width: 300px;
    background-color: #fff;
    border: var(--ControlMenuPanel-DropdownPanel-border-width) solid
      var(--ControlMenuPanel-DropdownPanel-border-color);
    z-index: 10;
    top: calc(100% - var(--ControlMenuPanel-DropdownPanel-border-width));
    left: 0;
    padding: 0;
    box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
  }
  .isOpen .DropdownPanel {
    opacity: 1;
    height: auto;
    width: auto;
    padding: 10px 4px 10px 4px;
    border-top-right-radius: 3px;
  }

  :global(.ControlMenuPanel:not(.flex) + .ControlMenuPanel:not(.flex)) {
    border-top: 1px solid var(--ControlMenuPanel-DropdownPanel-border-color);
  }

  :global(.ControlMenuPanel .ControlMenuPanel) {
    border-top: 0;
    margin: 0;
  }

  :global(.ControlMenuPanel .ControlMenuPanel + .ControlMenuPanel) {
    border-left: 1px solid #ccc;
    margin-left: 10px;
    padding-left: 10px;
  }

  :global(.ControlMenuPanel .Button.toggle) {
    display: flex;
    width: 16px;
    height: 16px;
    border: 1px solid #ccc;
    text-decoration: none;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
  }
</style>
