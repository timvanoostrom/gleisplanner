<script lang="ts">
  import { onMount } from 'svelte';
  import base from '../base.json';
  import Button from './Button.svelte';
  import { GLEISPLAN_NAME_DEFAULT } from './config/constants';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { downloadSvg } from './helpers/svg';
  import { isAppConfigReady } from './store/appConfig';
  import {
    createNewGleisPlan,
    deleteGleisPlan,
    downloadGleisPlan,
    gleisPlanSaved,
    gleisPlanSavedId,
    importSavedConfig,
    loadGleisPlanSaved,
    saveGleisPlan,
  } from './store/workspace';
  import type { SavedConfig } from './types';

  function importFile(event, doMerge: boolean = false) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (evt) {
        try {
          const config: SavedConfig = JSON.parse(evt.target.result as string);
          // console.log('cfg', config);
          if (config.gleisPlanned && config.dateUpdated) {
            importSavedConfig(config, doMerge);
          }
        } catch (eror) {
          alert('Could not import configuration');
        }
      };

      reader.onerror = function (evt) {
        console.error('An error ocurred reading the file', evt);
      };

      reader.readAsText(file, 'UTF-8');
    }
  }

  function newPlan() {
    if (confirm('Are you sure?')) {
      createNewGleisPlan();
    }
  }

  $: gleisPlanSavedActive = $gleisPlanSaved[$gleisPlanSavedId];

  onMount(() => {
    isAppConfigReady().then(() => {
      if (gleisPlanSavedActive === undefined) {
        console.info('Created default plan');
        fetch(`/${base}/plans/${GLEISPLAN_NAME_DEFAULT}`)
          .then((response) => response.json())
          .then((gleisplan) => {
            importSavedConfig(gleisplan);
          });
      }
    });
  });
</script>

<ControlMenuPanel
  flex={false}
  startMinimized={true}
  toggle={true}
  title="Save configuration"
>
  <select
    value={$gleisPlanSavedId}
    disabled={!Object.keys($gleisPlanSaved).length}
    on:input={(e) => loadGleisPlanSaved(e.target.value)}
  >
    <option value={''}>------</option>
    {#each Object.entries($gleisPlanSaved) as [id, { dateUpdated, name }] (id)}
      <option value={id}>
        {name}
      </option>
    {/each}
  </select>
  {#if $gleisPlanSavedId}
    <Button
      on:click={() => {
        saveGleisPlan($gleisPlanSavedId);
      }}
    >
      save
    </Button>
  {/if}
  <Button
    on:click={() => {
      const saveName = window.prompt(
        'Gleisplan name',
        `Gleisplan ${Object.keys($gleisPlanSaved).length + 1}`
      );
      if (saveName) {
        saveGleisPlan(null, saveName);
      }
    }}
  >
    save as...
  </Button>
  {#if $gleisPlanSavedId}
    <Button
      on:click={() => {
        if (window.confirm('Really?')) {
          deleteGleisPlan($gleisPlanSavedId);
        }
      }}
    >
      delete
    </Button>
  {/if}
  {#if $gleisPlanSavedId}
    <Button
      on:click={() => {
        downloadGleisPlan(gleisPlanSavedActive.name);
      }}
    >
      download to disk
    </Button>
  {/if}
  <Button className="ImportButton">
    Import
    <span class="InputHide">
      <input
        accept="application/json,.json"
        on:change={(event) => importFile(event)}
        type="file"
      />
    </span>
  </Button>
  <Button className="ImportButton">
    Merge
    <span class="InputHide">
      <input
        accept="application/json,.json"
        on:change={(event) => {
          if (confirm('Are you sure you want to merge the config? ')) {
            importFile(event, true);
          }
        }}
        type="file"
      />
    </span>
  </Button>
  <Button className="NewButton" on:click={() => newPlan()}>New</Button>
  <Button
    on:click={() => {
      downloadSvg(document.querySelector('svg'), gleisPlanSavedActive.name);
    }}>download svg</Button
  >
</ControlMenuPanel>

<style>
  :global(.ImportButton) {
    position: relative;
  }

  .InputHide {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    opacity: 0;
  }
</style>
