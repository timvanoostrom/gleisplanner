<script lang="ts">
  import { identity } from 'svelte/internal';

  import Button from './Button.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import Dialog from './Dialog.svelte';
  import Icon from './Icon.svelte';
  import {
    createBlock,
    assignTo,
    blocksDB,
    deleteBlock,
    updateBlock,
    blockEntriesExtended,
  } from './store/blocks';
  import { gleisIdsActive, gleisPlanned } from './store/gleis';

  import { toggleTool, tools } from './store/workspace';
  import { Block, BlockDirection } from './types';

  $: blockIdActive = $gleisIdsActive
    .map((id) => $gleisPlanned[id])
    .find((gleisPropsPlanned) => !!gleisPropsPlanned?.blockId)?.blockId;
  $: blockActive = blockIdActive && $blocksDB[blockIdActive];

  let okLabel: string = '';

  $: {
    switch ($tools.block.action) {
      case 'create':
        okLabel = 'Add';
        break;
      case 'update':
        okLabel = 'Update';
        break;
      case 'assignTo':
        okLabel = 'Assign';
        break;
      case 'delete':
        okLabel = 'Delete';
        break;
    }
  }
</script>

<ControlMenuPanel flex={false} toggle={true} title="Blocks">
  <div slot="header-right">
    <Button
      on:click={() =>
        toggleTool('block', {
          action: 'create',
          data: { title: 'X-B#', direction: BlockDirection.C1_C2 },
        })}
    >
      Add
    </Button>
  </div>
  <ul class="List">
    {#each $blockEntriesExtended as block}
      <li
        class="ListItem"
        class:isBlockSelected={block.id === $tools.block.data?.id}
      >
        <h4 class="ListItem-title">
          <span role="button" class="BlockName" on:click={() => void 0}>
            {block.title}
          </span>
          <span>{block.totalLength}cm</span>
        </h4>
        <span class="ListItem-buttons">
          <Button
            on:click={() =>
              toggleTool('block', { action: 'update', data: block })}
          >
            <Icon name="pencil-alt" size={12} />
          </Button>
          <Button
            on:click={() => {
              if (confirm('Delete block?')) {
                deleteBlock(block.id);
              }
            }}>&times;</Button
          >
        </span>
      </li>
    {/each}
  </ul>
</ControlMenuPanel>

{#if $tools.block.enabled}
  <Dialog
    id="BlocksDialog"
    height="160px"
    width="260px"
    isOpen={true}
    on:close={() => {
      console.log('onclose!!');
      toggleTool('block');
    }}
    on:created={() => {}}
  >
    <div class="DialogContent">
      {#if $tools.block.action == 'create' || $tools.block.action == 'update'}
        <input placeholder="Block title" bind:value={$tools.block.data.title} />
        <div class="BlockDirection-radios">
          <h4>Direction</h4>
          <label>
            <input
              type="radio"
              bind:group={$tools.block.data.direction}
              name="blockDirection"
              value={BlockDirection.C1_C2}
            />
            C1 &mdash; C2
          </label>
          <label>
            <input
              type="radio"
              bind:group={$tools.block.data.direction}
              name="blockDirection"
              value={BlockDirection.C2_C1}
            />
            C2 &mdash; C1
          </label>
          <label>
            <input
              type="radio"
              bind:group={$tools.block.data.direction}
              name="blockDirection"
              value={BlockDirection.CX_CX}
            />
            CX &mdash; CX
          </label>
        </div>
      {/if}

      {#if $tools.block.action == 'assignTo'}
        <select bind:value={$tools.block.data}>
          {#each Object.entries($blocksDB) as [id, block]}
            <option value={block}>{block.title}</option>
          {/each}
        </select>
      {/if}

      {#if $tools.block.action == 'delete'}
        <p>Select block to delete.</p>
        <select bind:value={$tools.block.data}>
          {#each Object.entries($blocksDB) as [id, block]}
            <option value={block}>{block.title}</option>
          {/each}
        </select>
      {/if}
    </div>
    <footer class="DialogFooter">
      <Button
        on:click={() => {
          switch ($tools.block.action) {
            case 'create':
              createBlock($tools.block.data);
              break;
            case 'update':
              updateBlock($tools.block.data);
              break;
            case 'assignTo':
              assignTo($tools.block.data.id, $gleisIdsActive);
              break;
            case 'delete':
              deleteBlock($tools.block.data.selectedBlock.id);
              break;
          }

          toggleTool('block');
        }}>{okLabel}</Button
      >
      <Button
        variant="plain"
        on:click={() => {
          toggleTool('block');
        }}
      >
        Cancel
      </Button>
    </footer>
  </Dialog>
{/if}

<style>
  .DialogContent {
    padding-bottom: 1rem;
  }
  .BlockDirection-radios {
    padding: 1rem 0;
  }
  .BlockDirection-radios h4 {
    margin: 0;
  }
  .BlockDirection-radios label {
    display: block;
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
  .isBlockSelected {
    background-color: thistle;
  }
</style>
