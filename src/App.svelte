<script lang="ts">
  import { onMount } from 'svelte';
  import BezetzController from './BezetzController.svelte';
  import BezetzGleis from './BezetzGleis.svelte';
  import Sections from './Sections.svelte';
  import SectionSymbols from './SectionSymbols.svelte';
  import Button from './Button.svelte';
  import { trackLibByArtNr } from './config/trackLib';
  import ConnectionPane from './ConnectionPane.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import DimensionsControl from './DimensionsControl.svelte';
  import FlexGleisModeller from './FlexGleisModeller.svelte';
  import Gleis from './Gleis.svelte';
  import GleisConfig from './GleisConfig.svelte';
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
  import SelectionTools from './SelectionTools.svelte';
  import ShortCurcuitConnections from './ShortCurcuitConnections.svelte';
  import SideMenu from './SideMenu.svelte';
  import SlopeConfig from './SlopeConfig.svelte';
  import SlopeInfo from './SlopeInfo.svelte';
  import { isAppConfigReady } from './store/appConfig';
  import { getAssignedSectionByGleisId } from './store/sections';
  import {
    gleisBezetz,
    gleisIdsActive,
    gleisPlannedSelected,
    gleisPlannedSelectedByLayerId,
    gleisPlannedUnselectedByLayerId,
    isCutPathActive,
    setGleisIdsActive,
    singleFlexActive,
  } from './store/gleis';
  import {
    activeGuide,
    fillDialogActive,
    guidesToolShapeType,
    isAnyToolEnabled,
    slopesByLayerId,
    toggleTool,
    tools,
    zoomzer,
  } from './store/workspace';
  import TrackLibControl from './TrackLibControl.svelte';

  const tracksByArtNr = $trackLibByArtNr;

  $: isLoading = true;
  $: isGleisModeActive = !isAnyToolEnabled();

  onMount(() => {
    isAppConfigReady().then(() => {
      isLoading = false;
    });
  });

  function selectRoute(id: string) {
    // const route = $gleisBezetz.routes[id];
    // if (route) {
    //   const ids = route.route.links.map((x) => x[3].id);
    //   setGleisIdsActive(ids);
    // }
    gleisBezetz.update((bezetz) => {
      bezetz.activeRouteId = id;
      return bezetz;
    });
  }
</script>

<main class="App" class:isLoading>
  <header class="Header">
    <h1 class="Logo">Gleis planner</h1>
    <TrackLibControl />
    <div class="PanelGroup">
      <GleisStats />
      <GleisConfig />

      <ControlMenuPanel title="Tools">
        <Button
          isActive={$tools.section.enabled}
          disabled={!$gleisIdsActive.length}
          on:click={() =>
            toggleTool('section', {
              action: 'addTo',
              data: getAssignedSectionByGleisId($gleisIdsActive[0]),
            })}
        >
          Add section
        </Button>
        <Button
          isActive={$tools.measure.enabled}
          on:click={() => toggleTool('measure')}
        >
          Measure line
        </Button>
        <Button
          isActive={$tools.guides.enabled}
          on:click={() => toggleTool('guides')}
        >
          Guides
        </Button>
        {#if $gleisPlannedSelected?.[0]?.type === 'Flex'}
          <Button
            isActive={$isCutPathActive}
            on:click={() => isCutPathActive.update((isActive) => !isActive)}
          >
            Cut path
          </Button>
        {/if}
        {#if $tools.guides.enabled}
          {#each ['line', 'rect'] as type}
            <Button
              isActive={$guidesToolShapeType === type}
              on:click={() => guidesToolShapeType.set(type)}
            >
              {type}
            </Button>
          {/each}
          <Button
            disabled={!$activeGuide}
            on:click={() => fillDialogActive.set(true)}>Fill</Button
          >
        {/if}
        <Button
          isActive={$tools.zoom.enabled}
          on:click={() => toggleTool('zoom')}
        >
          Zoom
        </Button>
        {#if $tools.zoom.enabled}
          <Button on:click={() => $zoomzer.reset()}>Reset</Button>
        {/if}
        <Button
          isActive={$tools.routeSimulation.enabled}
          on:click={() => toggleTool('routeSimulation')}
        >
          Route simulation
        </Button>
        {#if $tools.routeSimulation.enabled}
          <BezetzController />
        {/if}
        {#each Object.entries($gleisBezetz.routes) as [id], index}
          <Button
            isActive={id === $gleisBezetz.activeRouteId}
            on:click={() => selectRoute(id)}>{index}</Button
          >
        {/each}
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
              <FlexGleisModeller {gleisProps} />
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
      <SectionSymbols />
      {#if $tools.routeSimulation.enabled}
        <BezetzGleis />
      {/if}

      {#if $connectFlexPointStart}
        <FlexGleisModeller />
      {/if}
      <ShortCurcuitConnections />
      <Guides />
      {#if $tools.measure.enabled}
        <MeasureTool />
      {/if}
      {#if isGleisModeActive}
        <PlaneTools />
      {/if}
    </Plane>
  </div>

  <SideMenu>
    <LayerControl />
    <Sections />
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
