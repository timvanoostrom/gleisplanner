<script lang="ts">
  import { onMount } from 'svelte';
  import BezetzController from './BezetzController.svelte';
  import BezetzGleis from './BezetzGleis.svelte';
  import Button from './Button.svelte';
  import { trackLibByArtNr } from './config/trackLib';
  import ConnectionPane from './ConnectionPane.svelte';
  import ControlGleis from './ControlGleis.svelte';
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
  import Icon from './Icon.svelte';
  import LayerControl from './LayerControl.svelte';
  import MeasureTool from './MeasureTool.svelte';
  import Plane from './Plane.svelte';
  import PlaneTools from './PlaneTools.svelte';
  import SavesControl from './SavesControl.svelte';
  import Sections from './Sections.svelte';
  import SectionSymbols from './SectionSymbols.svelte';
  import SelectionTools from './SelectionTools.svelte';
  import ShortCurcuitConnections from './ShortCurcuitConnections.svelte';
  import SideMenu from './SideMenu.svelte';
  import SlopeConfig from './SlopeConfig.svelte';
  import SlopeInfo from './SlopeInfo.svelte';
  import { isAppConfigReady } from './store/appConfig';
  import {
    gleisIdsActive,
    gleisPlannedSelected,
    gleisPlannedSelectedByLayerId,
    gleisPlannedUnselectedByLayerId,
    isCutPathActive,
    singleFlexActive,
  } from './store/gleis';
  import {
    assignBlock,
    hasBlocksAssigned,
    hasMultipleSectionsSelected,
    hasSectionsAssigned,
    toggleSection,
  } from './store/sections';
  import {
    activeGuide,
    fillDialogActive,
    guidesToolShapeType,
    isAnyToolEnabled,
    operationsMode,
    slopesByLayerId,
    toggleOperationsMode,
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
</script>

<main
  class="App"
  class:isLoading
  class:operation-mode-control={$operationsMode === 'control'}
  class:operation-mode-build={$operationsMode === 'build'}
>
  <header class="Header">
    <h1 class="Logo">Gleis planner</h1>
    <!-- svelte-ignore missing-declaration -->

    {#if $operationsMode === 'control'}
      <div class="PanelGroup">
        <ControlMenuPanel title="Mode">
          <Button on:click={() => toggleOperationsMode()}>Build</Button>
        </ControlMenuPanel>
        <BezetzController />
      </div>
    {/if}
    {#if $operationsMode === 'build'}
      <TrackLibControl />
      <div class="PanelGroup">
        <ControlMenuPanel title="Mode">
          <Button on:click={() => toggleOperationsMode()}>Control</Button>
        </ControlMenuPanel>
        <GleisStats />
        <GleisConfig />
        <ControlMenuPanel title="Controls">
          <Button
            isActive={$hasSectionsAssigned}
            on:click={(event) => toggleSection($gleisIdsActive)}
          >
            Section
            {#if $hasMultipleSectionsSelected}
              <Icon size={12} name="exclamation-triangle" />
            {/if}
          </Button>
          <Button isActive={$hasBlocksAssigned} on:click={() => assignBlock()}>
            Block
          </Button>
        </ControlMenuPanel>
        <ControlMenuPanel title="Tools">
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
        </ControlMenuPanel>
      </div>
    {/if}
  </header>

  <div class="PlaneContainer">
    <Plane>
      {#if $operationsMode === 'build'}
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
      {/if}
      {#if $operationsMode === 'control'}
        {#each Object.entries($gleisPlannedUnselectedByLayerId) as [layerId, gleisPlanned] (layerId)}
          {#each gleisPlanned as gleisProps (gleisProps.id)}
            <ControlGleis
              {gleisProps}
              proto={tracksByArtNr[gleisProps.artnr]}
            />
          {/each}
        {/each}
        <BezetzGleis />
      {/if}
      <SectionSymbols />
      {#if $operationsMode === 'build'}
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
