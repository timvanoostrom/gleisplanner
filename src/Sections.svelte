<script lang="ts">
  import Button from './Button.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import Dialog from './Dialog.svelte';
  import Icon from './Icon.svelte';
  import {
    createSection,
    addTo,
    blocksDB,
    deleteSection,
    updateSection,
    blockEntriesExtended,
  } from '././store/sections';
  import { gleisIdsActive, gleisPlanned } from './store/gleis';

  import { toggleTool, tools } from './store/workspace';
  import { Section, SectionDirection, Tab } from './types';
  import MenuTabs from './MenuTabs.svelte';

  $: blockIdActive = $gleisIdsActive
    .map((id) => $gleisPlanned[id])
    .find((gleisPropsPlanned) => !!gleisPropsPlanned?.blockId)?.blockId;
  $: blockActive = blockIdActive && $blocksDB[blockIdActive];

  let okLabel: string = 'Ok';
  let tabs: Tab[] = [];

  $: {
    switch ($tools.section.action) {
      case 'addTo':
        tabs = [{ title: 'Add section' }, { title: 'New section' }];
        break;
    }
  }
</script>

<ControlMenuPanel flex={false} toggle={true} title="Sections">
  <div slot="header-right">
    <Button
      on:click={() =>
        toggleTool('section', {
          action: 'create',
          data: { title: 'X-B#', direction: SectionDirection.C1_C2 },
        })}
    >
      Add
    </Button>
  </div>
  <ul class="List">
    {#each $blockEntriesExtended as section}
      <li
        class="ListItem"
        class:isSectionSelected={section.id === $tools.section.data?.id}
      >
        <h4 class="ListItem-title">
          <span role="button" class="SectionName" on:click={() => void 0}>
            {section.title}
          </span>
          <span>{section.totalLength}cm</span>
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
      <MenuTabs {tabs}>
        <div slot="tab-1">
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
                  value={SectionDirection.C1_C2}
                />
                C1 &mdash; C2
              </label>
              <label>
                <input
                  type="radio"
                  bind:group={$tools.section.data.direction}
                  name="blockDirection"
                  value={SectionDirection.C2_C1}
                />
                C2 &mdash; C1
              </label>
              <label>
                <input
                  type="radio"
                  bind:group={$tools.section.data.direction}
                  name="blockDirection"
                  value={SectionDirection.CX_CX}
                />
                CX &mdash; CX
              </label>
            </div>
          {/if}

          {#if $tools.section.action == 'addTo'}
            <select
              class="Select-availableBlocks"
              bind:value={$tools.section.data}
            >
              {#each Object.entries($blocksDB) as [id, section]}
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
        <div slot="tab-2" />
      </MenuTabs>
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
</style>
