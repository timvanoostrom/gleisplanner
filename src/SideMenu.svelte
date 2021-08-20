<script lang="ts">
  import Icon from './Icon.svelte';
  import { sidebarState } from './store/workspace';
  const [sidebarStateValue, setSidebarState] = sidebarState;
  $: isVisible = $sidebarStateValue === 'visible';
</script>

<aside class="SideMenu" class:isVisible>
  <slot />
  <div
    class="Toggle"
    on:click={() => setSidebarState(isVisible ? 'hidden' : 'visible')}
  >
    <Icon name="chevron-left" />
  </div>
</aside>

<style>
  .SideMenu {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 370px;
    background-color: #fff;
    box-shadow: -10px 0 25px 5px rgba(0, 0, 0, 0.03);
    transition: transform 200ms ease-in-out;
    transform: translateX(calc(100% - 40px));
  }
  .SideMenu :global(.ControlMenuPanel) {
    padding: 5px;
  }
  .SideMenu :global(.ControlMenuPanel header) {
    margin-bottom: 5px;
  }
  .isVisible {
    transform: translateX(0);
  }
  .SideMenu .Toggle :global(.Icon) {
    transform: rotate(0);
  }
  .SideMenu.isVisible .Toggle :global(.Icon) {
    transform: rotate(180deg);
    transition: transform 200ms ease-in-out;
  }
  .Toggle {
    position: absolute;
    top: 0;
    transform: translateX(-30px);
    width: 30px;
    height: 30px;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
</style>
