<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';
  import type { Tab } from './types';

  const dispatch = createEventDispatcher();

  export let tabs: Tab[] = [];
  export let tabSelected: string = 'tab-1';

  $: selectedTabId = tabSelected;

  function selectTab(id: string) {
    selectedTabId = id;
    dispatch('select', {
      id,
    });
  }
</script>

<div class="MenuTabs">
  {#if tabs.length}
    <div class="TabHead">
      {#each tabs as tab, index}
        <Button
          on:click={() => selectTab(`tab-${index + 1}`)}
          isActive={selectedTabId === `tab-${index + 1}`}
        >
          {tab.title}
        </Button>
      {/each}
    </div>
  {/if}
  <div class="MenuTabsContent">
    {#if selectedTabId === 'tab-1'}<slot name="tab-1" />{/if}
    {#if selectedTabId === 'tab-2'}<slot name="tab-2" />{/if}
    {#if selectedTabId === 'tab-3'}<slot name="tab-3" />{/if}
    {#if selectedTabId === 'tab-4'}<slot name="tab-4" />{/if}
    {#if selectedTabId === 'tab-5'}<slot name="tab-5" />{/if}
    {#if selectedTabId === 'tab-6'}<slot name="tab-6" />{/if}
    {#if selectedTabId === 'tab-7'}<slot name="tab-7" />{/if}
    {#if selectedTabId === 'tab-8'}<slot name="tab-8" />{/if}
    {#if selectedTabId === 'tab-9'}<slot name="tab-9" />{/if}
    {#if selectedTabId === 'tab-10'}<slot name="tab-10" />{/if}
  </div>
</div>

<style>
  .MenuTabsContent {
    padding: 1rem 0;
  }
</style>
