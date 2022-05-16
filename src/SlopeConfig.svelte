<script lang="ts">
  import { get } from 'svelte/store';
  import SVGPathCommander from 'svg-path-commander';
  import Button from './Button.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import Dialog from './Dialog.svelte';
  import { generateID } from './helpers/app';
  import { calculateTrackLengthCM } from './helpers/geometry';
  import {
    gleisIdsActive,
    gleisPlanned,
    gleisPlannedSelected,
    setGleisIdsActive,
    updateGleisPlanned,
  } from './store/gleis';
  import { slopes, slopesCalculated } from './store/workspace';
  import type {
    GleisPropsPlanned,
    PathSegmentProps,
    SlopeConfig,
    SlopeConfigBase,
  } from './types';

  let deleteDialogSlopeId: SlopeConfig['id'] = '';
  let slopeIdSelected: SlopeConfig['id'] = '';

  let editSlope = null;

  function gleisIdsInSameLayer(ids: Array<GleisPropsPlanned['id']>) {
    let prev;
    for (const id of ids) {
      const gleis = $gleisPlanned[id];
      if (!prev) {
        prev = gleis.layerId;
      }
      if (gleis.layerId !== prev) {
        return false;
      }
    }
    return true;
  }

  function isPartOfSlope(gleisIds: string[]) {
    return Object.values(get(slopes)).some((config) => {
      return config.gleisIds.some((id) => gleisIds.includes(id));
    });
  }

  function calcSlopeProperties(slopeBase: SlopeConfigBase): SlopeConfig {
    let startElevation = slopeBase.startElevation || 0;
    let totalLength = 0;

    // TODO: sort from...
    for (const id of slopeBase.gleisIds) {
      const gleis = $gleisPlanned[id];

      if (!gleis) {
        continue;
      }

      const mainPath = gleis?.pathSegments?.find(
        (path) => path.type === 'main'
      );

      totalLength += calculateTrackLengthCM(mainPath as PathSegmentProps);
    }

    return {
      ...slopeBase,
      totalLength,
      startElevation,
      elevation: Math.round((slopeBase.percentage / 100) * totalLength),
    };
  }

  function addSlope() {
    const gleisIds = $gleisPlannedSelected.map((g) => g.id);

    if (isPartOfSlope(gleisIds)) {
      alert('Gleis alredy part of Slope');
    }

    const slopeId = generateID();

    if (gleisIdsInSameLayer(gleisIds)) {
      const slope = calcSlopeProperties({
        title: `Slope ${Object.keys($slopes).length}`,
        id: slopeId,
        gleisIds,
        percentage: 2.5,
        startElevation: 0,
      });

      slopes.update((slopes) => {
        return {
          ...slopes,
          [slopeId]: slope,
        };
      });
    } else {
      alert('Slope gleis not in same layer');
    }
  }

  function deleteSlope(id: string) {
    slopes.update((slopes) => {
      const slopesUpdated = { ...slopes };
      delete slopesUpdated[id];
      console.log('updates', slopesUpdated);
      return slopesUpdated;
    });
  }

  function updateSlope(
    id: SlopeConfig['id'],
    slopeData?: Partial<SlopeConfig>
  ) {
    slopes.update((slopes) => {
      const slope = calcSlopeProperties({
        ...slopes[id],
        ...slopeData,
        id,
      });

      return {
        ...slopes,
        [id]: slope,
      };
    });
  }

  function reverseSlope(id: SlopeConfig['id']) {
    const slope = get(slopes)[id];

    if (slope.gleisIds.length > 1) {
      slopes.update((slopes) => {
        const gleisIds = [...slope.gleisIds];
        gleisIds.reverse();
        return {
          ...slopes,
          [id]: {
            ...slope,
            gleisIds,
          },
        };
      });
    } else {
      updateGleisPlanned((gleisPlanned) => {
        const [id] = slope.gleisIds;
        const gleis = gleisPlanned[id];
        return {
          ...gleisPlanned,
          [id]: {
            ...gleis,
            pathSegments: gleis.pathSegments.map((pathSegment) => {
              const path = new SVGPathCommander(pathSegment.d, {});
              path.reverse();
              return {
                ...pathSegment,
                d: path.toString(),
              };
            }),
          },
        };
      });
    }
  }

  //  slopes.update((slopes) => {
  //   return Object.fromEntries(
  //     Object.entries(slopes).map(([id, slope]) => {
  //       if (slope.gleisIds.some((id) => idsToDelete.includes(id))) {
  //         return [
  //           id,
  //           {
  //             ...slope,
  //             gleisIds: slope.gleisIds.filter(
  //               (id) => !idsToDelete.includes(id)
  //             ),
  //           },
  //         ];
  //       }
  //       return [id, slope];
  //     })
  //   );
  // });
</script>

<ControlMenuPanel
  flex={false}
  startMinimized={true}
  mode="toggle"
  title="Slopes"
>
  <div slot="header-right">
    <Button on:click={addSlope}>Add</Button>
  </div>
  <ul class="List">
    {#each $slopesCalculated as config}
      <li
        class="ListItem"
        class:isSlopeSelected={config.id === slopeIdSelected}
      >
        <div class="ListItem-header">
          <span
            role="button"
            class="LayerName"
            on:click={() => setGleisIdsActive(config.gleisIds || [])}
            on:dblclick={(event) => {
              editSlope = { ...config };
              // editDialogSlopeId = config.id;
              // newSlopeTitle = config.title;
              // newSlopePercentage = config.percentage;
              // newSlopeStartElevation = config.startElevation || 0;
            }}
          >
            <h4>{config.title}</h4>
            <small>{config.id}</small>
            <p>
              <span><b>Slope</b> {config.percentage}%</span>
              <span><b>Length</b> {config.totalLength}cm</span>
              <span
                ><b>Elevation</b>
                {config.startElevation}cm - {config.startElevation +
                  config.elevation}cm</span
              >
              <span
                ><b>Total elevation</b>
                {config.elevation}cm</span
              >
            </p>
          </span>
          <!-- <span>{}</span> -->
          <span class="Buttons">
            <Button on:click={() => reverseSlope(config.id)}>Reverse</Button>
            <Button
              on:click={() =>
                updateSlope(config.id, { gleisIds: $gleisIdsActive })}
            >
              Update
            </Button>
            <Button on:click={() => (deleteDialogSlopeId = config.id)}>
              Delete
            </Button>
          </span>
        </div>
      </li>
    {/each}
  </ul>
</ControlMenuPanel>

{#if editSlope?.id}
  <Dialog
    id="EditDialogLayer"
    isOpen={true}
    on:close={() => {
      editSlope = null;
    }}
  >
    <div class="DialogContent">
      <label><span>Name</span> <input bind:value={editSlope.title} /></label>
      <label
        ><span>Slope</span>
        <input
          type="number"
          step=".1"
          min="0"
          max="5"
          bind:value={editSlope.percentage}
        /></label
      >
      <label>
        <span>Start elevation</span>
        <input type="number" bind:value={editSlope.startElevation} />
      </label>
      <footer class="DialogFooter">
        <Button
          on:click={() => {
            updateSlope(editSlope.id, editSlope);
            editSlope = null;
          }}
        >
          Ok
        </Button>
        <Button variant="plain" on:click={() => (editDialogSlopeId = '')}>
          Cancel
        </Button>
      </footer>
    </div>
  </Dialog>
{/if}

{#if deleteDialogSlopeId}
  <Dialog
    id="DeleteDialogLayer"
    isOpen={true}
    on:close={() => {
      deleteDialogSlopeId = '';
    }}
  >
    <div class="DialogContent">
      <p>Delete slope? {deleteDialogSlopeId}</p>
      <footer class="DialogFooter">
        <Button
          on:click={() => {
            deleteSlope(deleteDialogSlopeId);
            deleteDialogSlopeId = '';
          }}
        >
          Ok
        </Button>
        <Button
          variant="plain"
          on:click={() => {
            deleteDialogSlopeId = '';
          }}
        >
          Cancel
        </Button>
      </footer>
    </div>
  </Dialog>
{/if}

<style>
  .List {
    margin: 0;
    padding: 0;
    list-style-type: none;
    margin-bottom: 30px;
  }
  .ListItem {
    padding: 5px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 5px;
  }
  .ListItem-header p,
  .ListItem-header h4 {
    margin: 0;
  }
  .ListItem-header h4 {
    padding: 5px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 5px;
  }
  .ListItem-header p {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .Buttons {
    display: block;
    padding: 5px 0;
    margin-top: 5px;
    border-top: 1px solid #eee;
  }
  .DialogContent label {
    display: flex;
    margin-bottom: 5px;
    justify-content: space-between;
  }
  .isSlopeSelected {
    background-color: thistle;
  }
</style>
