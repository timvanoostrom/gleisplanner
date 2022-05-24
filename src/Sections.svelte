<script lang="ts">
  import {
    addTo,
    createSection,
    deleteSection,
    sectionEntriesExtended,
    sectionIdsSelected,
    sectionsDB,
    selectSection,
    updateSection,
  } from '././store/sections';
  import Button from './Button.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import Dialog from './Dialog.svelte';
  import Icon from './Icon.svelte';
  import { gleisIdsActive, gleisPlanned } from './store/gleis';
  import { toggleTool, tools } from './store/workspace';

  $: blockIdActive = $gleisIdsActive
    .map((id) => $gleisPlanned[id])
    .find((gleisPropsPlanned) => !!gleisPropsPlanned?.blockId)?.blockId;
  $: blockActive = blockIdActive && $sectionsDB[blockIdActive];

  let okLabel: string = 'Ok';
</script>

<ControlMenuPanel flex={false} mode="toggle" title="Sections">
  <div slot="header-right">
    <Button
      on:click={() =>
        toggleTool('section', {
          action: 'create',
          data: { title: 'X-B#', direction: 'C1_C2' },
        })}
    >
      Add
    </Button>
  </div>
  <ul class="List">
    {#each $sectionEntriesExtended as section}
      <li
        class="ListItem"
        class:isSectionSelected={$sectionIdsSelected.includes(section.id)}
      >
        <h4
          class="ListItem-title"
          on:click={(event) => selectSection(section.id, !event.shiftKey)}
        >
          <span role="button" class="SectionName" on:click={() => void 0}>
            {section.title}
          </span>
          <span>{section.totalLength}cm</span>
          {#if !!section.blockId}
            <span class="Block-assigned" title={section.blockTitle}>
              {section.blockTitle}
            </span>
          {/if}
        </h4>
        <span class="ListItem-buttons">
          <Button
            on:click={() =>
              toggleTool('section', { action: 'update', data: section })}
          >
            <Icon name="pencil-alt" size={12} />
          </Button>
          <Button
            on:click={() => {
              toggleTool('section', { action: 'delete', data: section });
              // if (confirm('Delete section?')) {
              //   deleteSection(section.id);
              // }
            }}>&times;</Button
          >
        </span>
      </li>
    {/each}
  </ul>
</ControlMenuPanel>

{#if $tools.section.enabled}
  <Dialog
    id="SectionsDialog"
    height="fit-content"
    width="260px"
    isOpen={true}
    on:close={() => {
      toggleTool('section');
    }}
    on:created={() => {}}
  >
    <div class="DialogContent">
      {#if $tools.section.action == 'create' || $tools.section.action == 'update'}
        <input
          placeholder="Section title"
          bind:value={$tools.section.data.title}
        />
        <div class="SectionDirection-radios">
          <h4>Direction</h4>
          <label>
            <input
              type="radio"
              bind:group={$tools.section.data.direction}
              name="blockDirection"
              value={'C1_C2'}
            />
            C1 &mdash; C2
          </label>
          <label>
            <input
              type="radio"
              bind:group={$tools.section.data.direction}
              name="blockDirection"
              value={'C2_C1'}
            />
            C2 &mdash; C1
          </label>
          <label>
            <input
              type="radio"
              bind:group={$tools.section.data.direction}
              name="blockDirection"
              value={'CX_CX'}
            />
            CX &mdash; CX
          </label>
        </div>
      {/if}

      {#if $tools.section.action == 'addTo'}
        <select class="Select-availableBlocks" bind:value={$tools.section.data}>
          {#each Object.entries($sectionsDB) as [id, section]}
            <option value={section}>{section.title}</option>
          {/each}
        </select>
      {/if}

      {#if $tools.section.action == 'delete'}
        <p>
          Are you sure you want to delete <strong
            >{$tools.section.data.title}</strong
          > ?
        </p>
      {/if}
      <footer class="DialogFooter">
        <Button
          disabled={!$tools.section.data?.id}
          on:click={() => {
            switch ($tools.section.action) {
              case 'create':
                createSection($tools.section.data);
                break;
              case 'update':
                updateSection($tools.section.data);
                break;
              case 'addTo':
                if ($tools.section.data.id) {
                  addTo($tools.section.data.id, $gleisIdsActive);
                }
                break;
              case 'delete':
                deleteSection($tools.section.data.id);
                break;
            }

            toggleTool('section');
          }}>{okLabel}</Button
        >
        <Button
          variant="plain"
          on:click={() => {
            toggleTool('section');
          }}
        >
          Cancel
        </Button>
      </footer>
    </div>
  </Dialog>
{/if}

<style>
  .DialogContent {
    padding-bottom: 1rem;
  }
  .DialogFooter {
    padding-top: 1rem;
  }
  .SectionDirection-radios {
    padding: 1rem 0;
  }
  .SectionDirection-radios h4 {
    margin: 0;
  }
  .SectionDirection-radios label {
    display: section;
  }

  .List {
    margin: 0;
    padding: 0;
    list-style-type: none;
    margin-bottom: 30px;
  }
  .ListItem {
    display: flex;
    align-items: center;
    padding: 5px 10px 5px 10px;
    border-bottom: 1px solid #ccc;
  }
  .ListItem-title {
    flex: 1;
    margin: 0;
  }
  .ListItem-buttons {
    display: flex;
  }
  .isSectionSelected {
    background-color: thistle;
  }
  .Select-availableBlocks {
    min-width: 100px;
  }
  .Block-assigned {
    display: inline-block;
    max-width: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid #000;
    font-size: 8px;
    font-weight: normal;
    white-space: nowrap;
    padding: 1px 3px;
  }
</style>
