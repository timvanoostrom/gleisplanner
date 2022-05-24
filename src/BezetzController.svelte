<script lang="ts">
  import Button from './Button.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { gleisBezetz } from './store/bezetz';
  import {
    locosDB,
    setLocoAtPoint,
    setLocoPoint,
    startLoco,
    stopLoco,
  } from './store/loco';
  import {
    clearRouteDestination,
    generateRoutes,
    previewRoute,
    resetPreview,
    resetRoutes,
    setActiveRouteId,
  } from './store/routes';
  import { blocksDB } from './store/sections';

  function stopAll() {
    Object.entries($gleisBezetz).forEach(([locoID]) => {
      stopLoco(locoID);
    });
  }

  function startAll() {
    Object.entries($gleisBezetz)
      .filter(([locoID, { activeRouteId }]) => !!activeRouteId)
      .forEach(([locoID]) => {
        startLoco(locoID);
      });
  }

  function resetAll() {
    resetPreview();

    Object.entries($gleisBezetz).forEach(([locoID]) => {
      stopLoco(locoID);
      resetRoutes(locoID);
      setLocoAtPoint(locoID);
    });
  }

  function runSimulation() {
    const blockIDs = Object.keys($blocksDB);

    gleisBezetz.update((gleisBezetz) => {
      for (const [locoID, loco] of Object.entries($locosDB)) {
        gleisBezetz[locoID].departureBlockID = blockIDs.pop();
      }
      blockIDs.pop();
      for (const [locoID, loco] of Object.entries($locosDB)) {
        gleisBezetz[locoID].destinationBlockID = blockIDs.pop();
      }
      return gleisBezetz;
    });

    for (const [locoID, loco] of Object.entries($locosDB)) {
      setLocoPoint(locoID);
      generateRoutes(
        loco,
        $gleisBezetz[locoID].departureBlockID,
        $gleisBezetz[locoID].destinationBlockID
      );
    }
  }

  $: someStarted = Object.entries($gleisBezetz).some(
    ([locoID]) => $locosDB[locoID].velocity !== 0
  );
</script>

<ControlMenuPanel title="Trains 'n Routes" dropdown startOpen mode="click">
  <div class="loco-destination-panel">
    <!-- <Button
    isActive={$tools.routeSimulation.enabled}
    on:click={() => {
      toggleTool('routeSimulation');
    }}
  >
    Route simulation
  </Button> -->

    <table class="loco-destination-table">
      <thead>
        <tr>
          <th>Loco</th>
          <th>Speed</th>
          <th>Depart from</th>
          <th>Destination</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries($locosDB) as [locoID, loco]}
          <tr>
            <td class="loco-cell" style={`color: ${loco.color}`}>
              {loco.title}
            </td>
            <td>{loco.velocity}</td>
            <td class="loco-assign">
              {#if !!$gleisBezetz[locoID]}
                <label>
                  <span>Departure</span>
                  <select
                    disabled={$locosDB[locoID].velocity !== 0}
                    bind:value={$gleisBezetz[locoID].departureBlockID}
                    on:change={() => {
                      setLocoPoint(locoID);
                      clearRouteDestination(locoID);
                    }}
                  >
                    <optgroup label="Schattenbahnhof 1">
                      {#each Object.entries($blocksDB) as [id, block]}
                        <option value={id}>{block.title}</option>
                      {/each}
                    </optgroup>
                    <option value={null}>Off track</option>
                  </select>
                </label>
              {/if}
            </td>
            <td>
              {#if !!$gleisBezetz[locoID]}
                <label>
                  <span>Destination</span>
                  <select
                    disabled={$locosDB[locoID].velocity !== 0 ||
                      !$gleisBezetz[locoID].departureBlockID}
                    bind:value={$gleisBezetz[locoID].destinationBlockID}
                    on:change={() => {
                      if (
                        $gleisBezetz[locoID].departureBlockID &&
                        $gleisBezetz[locoID].destinationBlockID
                      ) {
                        setLocoPoint(locoID);
                        generateRoutes(
                          loco,
                          $gleisBezetz[locoID].departureBlockID,
                          $gleisBezetz[locoID].destinationBlockID
                        );
                      }
                    }}
                  >
                    <optgroup label="Schattenbahnhof 1">
                      {#each Object.entries($blocksDB) as [id, block]}
                        <option value={id}>{block.title}</option>
                      {/each}
                    </optgroup>
                  </select>
                </label>
              {/if}
            </td>
            <!-- <td>
              <Button
                disabled={!$gleisBezetz[locoID]?.departureBlockID ||
                  !$gleisBezetz[locoID]?.destinationBlockID ||
                  !!(
                    $gleisBezetz[locoID]?.departureBlockID &&
                    $gleisBezetz[locoID]?.destinationBlockID &&
                    Object.keys($gleisBezetz[locoID]?.routes || {}).length
                  )}
                on:click={() => {
                  generateRoutes(
                    loco,
                    $gleisBezetz[locoID].departureBlockID,
                    $gleisBezetz[locoID].destinationBlockID
                  );
                }}
              >
                Generate routes
              </Button>
            </td> -->
            {#if !!$gleisBezetz[locoID]?.routes}
              <td>
                <div class="route-variations">
                  <select
                    bind:value={$gleisBezetz[locoID].activeRouteId}
                    on:change={() => {
                      const id = $gleisBezetz[locoID].activeRouteId;
                      setActiveRouteId(locoID, id);
                      previewRoute(locoID, id);
                      setLocoPoint(locoID);
                    }}
                    disabled={$locosDB[locoID].velocity !== 0 ||
                      !$gleisBezetz[locoID].departureBlockID ||
                      !$gleisBezetz[locoID].destinationBlockID}
                  >
                    {#each Object.entries($gleisBezetz[locoID].routes) as [id], index (id)}
                      <option
                        selected={id === $gleisBezetz[locoID].activeRouteId}
                        value={id}
                      >
                        {index}
                      </option>
                    {/each}
                  </select>
                </div>
              </td>
              <td class="start-stop-cell">
                <Button
                  disabled={!$gleisBezetz[locoID]?.activeRouteId}
                  on:click={() => {
                    resetPreview();
                    (loco.velocity !== 0 ? stopLoco : startLoco)(locoID);
                  }}>{loco.velocity !== 0 ? 'Stop' : 'Start'}</Button
                >
              </td>
              <td>
                <Button
                  on:click={() => resetRoutes(locoID)}
                  disabled={!$gleisBezetz[locoID]?.activeRouteId}
                >
                  Cancel
                </Button>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="TableFooter">
      <Button on:click={() => resetAll()}>Reset all</Button>
      <Button on:click={() => (someStarted ? stopAll() : startAll())}>
        {someStarted ? 'Stop all' : 'Start all'}
      </Button>
      <Button on:click={() => runSimulation()}>Run simulation</Button>
    </div>
  </div>
</ControlMenuPanel>

<style>
  .loco-destination-panel {
    padding: 10px;
  }
  .loco-destination-table {
    min-width: 400px;
    white-space: nowrap;
  }
  .loco-destination-table td,
  .loco-destination-table th {
    text-align: left;
  }
  .loco-cell {
    padding-right: 10px;
  }
  .route-variations {
    max-width: 100px;
    overflow-x: auto;
  }
  .TableFooter {
    display: flex;
    justify-content: flex-end;
    margin-top: 5px;
    padding-top: 5px;
    border-top: 1px solid #ccc;
  }
</style>
