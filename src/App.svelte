<script lang="ts">
  import Button from './Button.svelte';
  import { trackLibByArtNr } from './config/trackLib';
  import ConnectionPane from './ConnectionPane.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import DimensionsControl from './DimensionsControl.svelte';
  import FlexGleisModeller from './FlexGleisModeller.svelte';
  import Gleis from './Gleis.svelte';
  import GleisConnections from './GleisConnections.svelte';
  import GleisInventory from './GleisInventory.svelte';
  import GleisStats from './GleisStats.svelte';
  import GridControl from './GridControl.svelte';
  import Guides from './Guides.svelte';
  import { connectFlexPointStart } from './helpers/flex';
  import LayerControl from './LayerControl.svelte';
  import MeasureTool from './MeasureTool.svelte';
  import Plane from './Plane.svelte';
  import PlaneTools from './PlaneTools.svelte';
  import SavesControl from './SavesControl.svelte';
  import ScaleControl from './ScaleControl.svelte';
  import SelectionTools from './SelectionTools.svelte';
  import ShortCurcuitConnections from './ShortCurcuitConnections.svelte';
  import SideMenu from './SideMenu.svelte';
  import SlopeConfig from './SlopeConfig.svelte';
  import SlopeInfo from './SlopeInfo.svelte';
  import { initializers } from './store/appConfig';
  import {
    gleisIdsActive,
    gleisPlannedSelected,
    gleisPlannedSelectedByLayerId,
    gleisPlannedUnselectedByLayerId,
    singleFlexActive,
  } from './store/gleis';
  import {
    measureToolEnabled,
    setMeasureToolEnabled,
    guidesToolEnabled,
    setGuidesToolEnabled,
    slopesByLayerId,
  } from './store/workspace';
  import TrackLibControl from './TrackLibControl.svelte';

  let isLoading = true;

  const tracksByArtNr = $trackLibByArtNr;

  Promise.all(initializers).then(() => (isLoading = false));

  $: isGleisModeActive = !$measureToolEnabled && !$guidesToolEnabled;

  function toggleTool(name: 'measure' | 'guides') {
    switch (name) {
      case 'measure':
        setMeasureToolEnabled(!$measureToolEnabled);
        setGuidesToolEnabled(false);
        break;
      case 'guides':
        setGuidesToolEnabled(!$guidesToolEnabled);
        setMeasureToolEnabled(false);
        break;
    }
  }
</script>

<main class="App" class:isLoading>
  <header class="Header">
    <h1 class="Logo">Gleis planner</h1>
    <TrackLibControl />
    <div class="PanelGroup">
      <GleisStats />
      <ScaleControl />
      <ControlMenuPanel title="Shapes & Symbols">
        <Button>Guide</Button>
        <Button>Bridge</Button>
        <Button>Tunnel</Button>
        <Button>Booster</Button>
        <Button>GBM16</Button>
        <Button>OneControl</Button>
      </ControlMenuPanel>
      <ControlMenuPanel title="Tools">
        <Button
          isActive={$measureToolEnabled}
          on:click={() => toggleTool('measure')}
        >
          Measure line
        </Button>
        <Button
          isActive={$guidesToolEnabled}
          on:click={() => toggleTool('guides')}
        >
          Guides
        </Button>
      </ControlMenuPanel>
    </div>
  </header>

  <div class="PlaneContainer">
    <Plane>
      {#each Object.entries($gleisPlannedUnselectedByLayerId) as [layerId, gleisPlanned] (layerId)}
        {#each gleisPlanned as gleisProps (gleisProps.id)}
          <Gleis {gleisProps} proto={tracksByArtNr[gleisProps.artnr]} />
        {/each}

        <GleisConnections {gleisPlanned} />
      {/each}
      {#if $gleisPlannedSelected.length}
        <SelectionTools gleisSelected={gleisPlannedSelected}>
          {#each $gleisPlannedSelected as gleisProps (gleisProps.id)}
            {#if $singleFlexActive?.id !== gleisProps.id}
              <Gleis {gleisProps} proto={tracksByArtNr[gleisProps.artnr]} />
            {:else}
              <FlexGleisModeller />
            {/if}
          {/each}
        </SelectionTools>
        {#each Object.entries($gleisPlannedSelectedByLayerId) as [layerId, gleisPlanned] (layerId)}
          {#if $slopesByLayerId[layerId]}
            {#each $slopesByLayerId[layerId] as slope}
              {#if slope.gleisIds.some((id) => $gleisIdsActive.includes(id))}
                <SlopeInfo {slope} />
              {/if}
            {/each}
          {/if}
        {/each}
        <GleisConnections
          gleisPlanned={$gleisPlannedSelected}
          selectionMode={isGleisModeActive}
        />
      {/if}

      {#if $connectFlexPointStart}
        <FlexGleisModeller />
      {/if}
      <ShortCurcuitConnections />
      <Guides />
      <MeasureTool />
      {#if isGleisModeActive}
        <PlaneTools />
      {/if}
    </Plane>
  </div>

  <SideMenu>
    <LayerControl />
    <SavesControl />
    <GleisInventory />
    <GridControl />
    <DimensionsControl />
    <ConnectionPane />
    <SlopeConfig />
  </SideMenu>
</main>

<style>
  .App {
    display: flex;
    flex-direction: column;
    max-height: calc(100% - 3px);
    transition: opacity 200ms ease-in;
  }
  .App.isLoading {
    pointer-events: none;
    opacity: 0.2;
  }
  .Header {
    padding: 10px;
    border-bottom: 2px solid #555;
  }
  .Logo {
    font-size: 12px;
    position: absolute;
    right: 10px;
    top: 10px;
    display: none;
  }
  .PlaneContainer {
    position: relative;
    min-height: 0;
    display: flex;
  }
  .Modal {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 10;
  }
  .SideMenu {
    position: absolute;
    right: 0;
  }
  .PanelGroup {
    display: flex;
  }
</style>
