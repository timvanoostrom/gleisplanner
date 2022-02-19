<script lang="ts">
  import debounce from 'lodash.debounce';
  import * as AColorPicker from 'a-color-picker';
  import SortableList from 'svelte-sortable-list';
  import Button from './Button.svelte';
  import { patterns } from './config/svg-fill-patterns';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import Dialog from './Dialog.svelte';
  import { generateID, getColor } from './helpers/app';
  import Icon from './Icon.svelte';
  import IconButton from './IconButton.svelte';
  import MenuTabs from './MenuTabs.svelte';
  import {
    gleisIdsActive,
    gleisPlanned,
    gleisPlannedSelected,
    setGleisIdsActive,
    updateGleis,
  } from './store/gleis';
  import {
    deleteLayer,
    layerControl,
    layersById,
    updateLayer,
  } from './store/layerControl';

  import type { GleisPropsPlanned, Layer } from './types';

  const DEFAULT_FILL = 'rgba(255, 130, 130, 1)';

  let layerColorInitial = DEFAULT_FILL;
  let deleteDialogLayerId: Layer['id'] = '';
  let editDialogLayerId: Layer['id'] = '';
  let colorPickerDialogId: Layer['id'] = '';
  let newLayerName = '';
  let mergeLayerIds = [];
  let isAddToLayerDialogActive = false;
  let addToLayerValueSelected = 'new-layer';
  let addToNewLayerName = `Layer ${$layerControl.layers.length + 1}`;

  $: list = $layerControl.layers;
  $: currentLayerCount = $layerControl.layers.length;
  $: editableItem = list.find((layer) => layer.id === editDialogLayerId);

  interface AddLayerProps {
    gleisIds?: Array<GleisPropsPlanned['id']>;
    name?: string;
    id?: string;
  }

  function addLayer(props?: AddLayerProps) {
    let layerId = props?.id;

    if (!layerId) {
      const count = $layerControl.layers.length + 1;
      const layerName =
        props?.name || window.prompt('Layer name', 'Layer ' + count);
      if (!layerName) {
        return;
      }
      layerId = generateID();

      const newLayer: Layer = {
        name: layerName,
        id: layerId,
        isVisible: true,
        locked: false,
        color: getColor(),
      };

      layerControl.update((layerControl) => {
        const selectedLayerIndex = layerControl.layers.findIndex(
          (layer) => layer.id === layerControl.activeLayerId
        );
        const layers = [...layerControl.layers];
        layers.splice(selectedLayerIndex, 0, newLayer);
        return {
          ...layerControl,
          layers,
        };
      });
    }

    if (props?.gleisIds?.length) {
      updateGleis(
        props.gleisIds.map((id) => {
          return {
            id,
            layerId,
          };
        })
      );
    }

    $layerControl.activeLayerId = layerId;
  }

  function onKeydownRouter(event) {
    switch (true) {
      case !!$gleisIdsActive.length && event.key === 'g' && event.metaKey:
        event.preventDefault();
        isAddToLayerDialogActive = true;
        break;
      default:
        break;
    }
  }

  function toggleLayerVisibility(layer: Layer) {
    const update = {
      [layer.id]: {
        isVisible: !layer.isVisible,
      },
    };
    updateLayer(update);
  }

  function toggleLayerLock(layer: Layer) {
    const locked = !layer.locked;
    const update = {
      [layer.id]: {
        locked,
      },
    };

    if (locked) {
      const ids = $gleisPlannedSelected
        .filter((gleis) => {
          return gleis.layerId !== layer.id;
        })
        .map((gleis) => gleis.id);

      setGleisIdsActive(ids);
    }
    updateLayer(update);
  }

  function selectLayer(event: MouseEvent, layer: Layer) {
    if (event.shiftKey) {
      event.preventDefault();
      if (layer.locked) {
        return;
      }
      if (!mergeLayerIds.includes(layer.id)) {
        mergeLayerIds = [...mergeLayerIds, layer.id];
      } else {
        mergeLayerIds = mergeLayerIds.filter((id) => id !== layer.id);
      }
    } else {
      $layerControl.activeLayerId = layer.id;
    }
  }

  function mergeLayers() {
    if (mergeLayerIds.length) {
      const gleisUpdates = [];
      const mergeToLayerId = mergeLayerIds.shift();

      for (const gleis of Object.values($gleisPlanned)) {
        if (mergeLayerIds.includes(gleis.layerId)) {
          gleisUpdates.push({ id: gleis.id, layerId: mergeToLayerId });
        }
      }

      updateGleis(gleisUpdates);

      for (const id of mergeLayerIds) {
        deleteLayer(id);
      }

      mergeLayerIds = [];
    }
  }

  function sortList(event) {
    layerControl.update((layerControl) => {
      return {
        ...layerControl,
        layers: event.detail.map((layer) => {
          return layer;
        }),
      };
    });
  }

  const updateLayerColor = debounce((color, colorPickerDialogId) => {
    if (!colorPickerDialogId) {
      return;
    }
    updateLayer({
      [colorPickerDialogId]: {
        color,
      },
    });
  }, 100);

  function assignPattern(patternId: string) {
    if (!colorPickerDialogId) {
      return;
    }
    updateLayer({
      [colorPickerDialogId]: {
        patternId,
      },
    });
  }
</script>

<svelte:window on:keydown={onKeydownRouter} />

<ControlMenuPanel flex={false} toggle={true} title="Layers">
  <div slot="header-right">
    {#if !mergeLayerIds.length}
      <Button
        on:click={() => {
          addLayer();
        }}
      >
        Add
      </Button>
    {/if}
    {#if mergeLayerIds.length}
      <Button on:click={mergeLayers}>merge selected</Button>
    {/if}
  </div>
  <SortableList key="id" let:item {list} on:sort={sortList}>
    <article
      class="Layer"
      class:isActiveLayer={$layerControl.activeLayerId === item.id}
      class:isMergeLayerId={mergeLayerIds.includes(item.id)}
      style={`border-left: 5px solid ${item.color}`}
      on:click={(event) => {
        if (item.locked) {
          return;
        }
        selectLayer(event, item);
      }}
    >
      <IconButton
        name={!item.isVisible ? 'eye-slash' : 'eye'}
        on:click={(event) => {
          event.stopPropagation();
          event.stopImmediatePropagation();
          toggleLayerVisibility(item);
        }}
      />
      <span
        role="button"
        class="LayerName"
        on:click={(event) => {
          if (item.locked) {
            return;
          }
          selectLayer(event, item);
        }}
        on:dblclick={(event) => {
          if (item.locked) {
            return;
          }
          editDialogLayerId = item.id;
          newLayerName = item.name;
        }}
      >
        {item.name}
      </span>

      {#if currentLayerCount !== 1}
        <Button on:click={() => toggleLayerLock(item)}>
          <Icon size={12} name={item.locked ? 'lock' : 'lock-open'} />
        </Button>
        <Button
          disabled={item.locked || !!mergeLayerIds.length}
          on:click={() => (deleteDialogLayerId = item.id)}
        >
          &times;
        </Button>
      {/if}
    </article>
  </SortableList>

  {#if isAddToLayerDialogActive}
    <Dialog
      id="AddToLayerDialog"
      isOpen={true}
      on:close={() => (isAddToLayerDialogActive = false)}
    >
      <div class="DialogContent">
        <select bind:value={addToLayerValueSelected}>
          <option value="new-layer">[new layer]</option>
          {#each $layerControl.layers as layer, index (layer.id + index)}
            <option value={layer.id}>{layer.name}</option>
          {/each}
        </select>

        {#if addToLayerValueSelected === 'new-layer'}
          <div>
            <input bind:value={addToNewLayerName} />
          </div>
        {/if}
        <footer class="DialogFooter">
          <Button
            on:click={() => {
              if (addToLayerValueSelected === 'new-layer') {
                addLayer({
                  gleisIds: $gleisIdsActive,
                  name: addToNewLayerName,
                });
              } else {
                addLayer({
                  gleisIds: $gleisIdsActive,
                  id: addToLayerValueSelected,
                });
              }
              isAddToLayerDialogActive = false;
            }}
          >
            Ok
          </Button>
          <Button
            variant="plain"
            on:click={() => (isAddToLayerDialogActive = false)}>Cancel</Button
          >
        </footer>
      </div>
    </Dialog>
  {/if}

  {#if deleteDialogLayerId}
    <Dialog
      id="DeleteDialogLayer"
      isOpen={true}
      on:close={() => {
        deleteDialogLayerId = '';
      }}
    >
      <div class="DialogContent">
        <p>Delete layer and all gleis in it?</p>
        <footer class="DialogFooter">
          <Button
            on:click={() => {
              deleteLayer(deleteDialogLayerId);
              deleteDialogLayerId = '';
            }}
          >
            Ok
          </Button>
          <Button variant="plain" on:click={() => (deleteDialogLayerId = '')}
            >Cancel</Button
          >
        </footer>
      </div>
    </Dialog>
  {/if}

  {#if editDialogLayerId}
    <Dialog
      id="EditDialogLayer"
      isOpen={true}
      on:close={() => {
        editDialogLayerId = '';
      }}
    >
      <div class="DialogContent">
        <input bind:value={newLayerName} />
        <Button
          variant="plain"
          on:click={(event) => {
            event.stopPropagation();
            colorPickerDialogId = editDialogLayerId;
            // selectLayer(event, item);
          }}
        >
          <span
            class="LayerColor"
            style={`background-color: ${editableItem?.color || 'transparent'}`}
          />
        </Button>
        <footer class="DialogFooter">
          <Button
            on:click={() => {
              updateLayer({
                [editDialogLayerId]: {
                  name: newLayerName,
                },
              });
              newLayerName = '';
              editDialogLayerId = '';
            }}
          >
            Ok
          </Button>
          <Button variant="plain" on:click={() => (editDialogLayerId = '')}
            >Cancel</Button
          >
        </footer>
      </div>
    </Dialog>
  {/if}
  {#if colorPickerDialogId}
    <Dialog
      id="ColorPickerDialog"
      height="auto"
      width="260px"
      isOpen={true}
      on:close={() => {
        colorPickerDialogId = '';
      }}
      on:created={() => {
        layerColorInitial =
          $layersById[colorPickerDialogId].color || layerColorInitial;
        console.log('!! layerColorInitial !!', layerColorInitial);
        const [picker] = AColorPicker.from('[data-color-picker]', {
          showHSL: false,
          showRGB: false,
          showHEX: false,
          showAlpha: true,
          color: layerColorInitial,
        });
        picker.on('change', (picker, color) => {
          updateLayerColor(color, colorPickerDialogId);
        });
      }}
    >
      <div class="DialogContent">
        <MenuTabs tabs={[{ title: 'Color' }, { title: 'Pattern' }]}>
          <div slot="tab-1">
            <ControlMenuPanel flex={false}>
              <div data-color-picker />
            </ControlMenuPanel>
          </div>
          <div slot="tab-2">
            <ControlMenuPanel flex={false}>
              <ul class="PatternExamples">
                <li
                  class="PatternExample"
                  class:isSelected={!$layersById[colorPickerDialogId].patternId}
                >
                  <Button variant="plain" on:click={() => assignPattern('')}
                    ><svg viewBox="0 0 25 25"
                      ><line x1={0} y1={0} x2={50} y2={50} stroke="#000" /></svg
                    ></Button
                  >
                </li>
                {#each Object.entries(patterns) as [id, pattern] (id)}
                  <li
                    class="PatternExample"
                    class:isSelected={$layersById[colorPickerDialogId]
                      .patternId === id}
                  >
                    <Button variant="plain" on:click={() => assignPattern(id)}>
                      <svg viewBox="0 0 25 25">
                        <g
                          >{@html pattern(
                            `example-pattern-${id}`,
                            '#000000'
                          )}</g
                        >
                        <rect
                          x="0"
                          y="0"
                          width="25"
                          height="25"
                          style={`stroke: #000000; fill: url(#example-pattern-${id});`}
                        />
                      </svg>
                    </Button>
                  </li>
                {/each}
              </ul>
            </ControlMenuPanel>
          </div>
        </MenuTabs>
        <footer class="DialogFooter">
          <Button
            on:click={() => {
              colorPickerDialogId = '';
            }}
          >
            Ok
          </Button>
          <Button
            variant="plain"
            on:click={() => {
              updateLayerColor(layerColorInitial, colorPickerDialogId);
              colorPickerDialogId = '';
            }}>Cancel</Button
          >
        </footer>
      </div>
    </Dialog>
  {/if}
</ControlMenuPanel>

<style>
  .Layer {
    display: flex;
    align-items: center;
    padding: 5px 10px;
    border-bottom: 1px solid #ccc;
  }

  .LayerName {
    flex: 1;
    padding-left: 10px;
  }

  .isActiveLayer {
    background-color: #eee;
  }

  .isMergeLayerId {
    background-color: lightblue;
  }

  .DialogFooter {
    margin-top: 10px;
    display: flex;
    justify-content: center;

    --Button-margin: 0px 6px;
  }

  .LayerColor {
    display: block;
    width: 10px;
    height: 10px;
    margin-left: 10px;
    border: 1px solid #000;
  }

  .PatternExamples {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 4px;
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .PatternExample {
    margin: 0;
    width: 50px;
    height: 50px;
    border: 2px solid #000;
  }

  .PatternExample.isSelected {
    border-color: red;
  }
</style>
