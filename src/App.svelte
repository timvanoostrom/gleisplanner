<script lang="ts">
  import { trackLibByArtNr } from './config/trackLib';
  import ConnectionPane from './ConnectionPane.svelte';
  import DimensionsControl from './DimensionsControl.svelte';
  import EditMode from './EditMode.svelte';
  import FlexGleisModeller from './FlexGleisModeller.svelte';
  import Gleis from './Gleis.svelte';
  import GleisConnections from './GleisConnections.svelte';
  import GleisInventory from './GleisInventory.svelte';
  import GleisStats from './GleisStats.svelte';
  import GridControl from './GridControl.svelte';
  import Guides from './Guides.svelte';
  import { connectFlexPointStart } from './helpers/flex';
  import LayerControl from './LayerControl.svelte';
  import Plane from './Plane.svelte';
  import SavesControl from './SavesControl.svelte';
  import ScaleControl from './ScaleControl.svelte';
  import SelectionTools from './SelectionTools.svelte';
  import SideMenu from './SideMenu.svelte';
  import { initializers } from './store/appConfig';
  import {
    gleisPlannedSelected,
    gleisPlannedUnselectedByLayerId,
    singleFlexActive,
  } from './store/gleis';
  import { editMode } from './store/workspace';
  import TrackLibControl from './TrackLibControl.svelte';

  let isLoading = true;

  const tracksByArtNr = $trackLibByArtNr;

  Promise.all(initializers).then(() => (isLoading = false));
</script>

<main class="App" class:isLoading data-editmode={$editMode}>
  <header class="Header">
    <h1 class="Logo">Gleis planner</h1>
    <TrackLibControl />
    <div class="PanelGroup">
      <GleisStats />
      <ScaleControl />
      <EditMode />
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
        <GleisConnections
          gleisPlanned={$gleisPlannedSelected}
          quickConnectEnabled={true}
        />
      {/if}
      {#if $connectFlexPointStart}
        <FlexGleisModeller />
      {/if}
      <Guides />
    </Plane>
  </div>

  <SideMenu>
    <LayerControl />
    <SavesControl />
    <GleisInventory />
    <GridControl />
    <DimensionsControl />
    <ConnectionPane />
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
