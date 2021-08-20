<script lang="ts">
  import { trackLibByArtNr } from './config/trackLib';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import IconButton from './IconButton.svelte';
  import { gleisIdsActive, gleisPlannedSelected } from './store/gleis';
  import { toDeg } from './helpers/geometry';

  let isConnectionPaneVisible: boolean = true;
</script>

<div class="ConnectionPane">
  <ControlMenuPanel
    flex={false}
    startMinimized={true}
    toggle={true}
    title="Gleis"
  >
    <IconButton
      name={!isConnectionPaneVisible ? 'eye-slash' : 'eye'}
      on:click={() => (isConnectionPaneVisible = !isConnectionPaneVisible)}
    />
    {#if isConnectionPaneVisible}
      <div class="ListContainer">
        <ul>
          {#each $gleisPlannedSelected as gleis}
            <li class:isActiveGleis={$gleisIdsActive.includes(gleis.id)}>
              <div>
                <span>{gleis.id}</span>
                <span>{$trackLibByArtNr[gleis.artnr].title}</span>
              </div>
              <pre>
          {JSON.stringify(
            { ...gleis, points: gleis.points.map(p => ({ ...p, connectAngle: toDeg(p.connectAngle||0) })) },
            null,
            ' '
          )}
        </pre>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </ControlMenuPanel>
</div>

<style>
  .ConnectionPane {
    position: relative;
  }
  .ListContainer {
    max-height: 200px;
    overflow: auto;
  }
  ul {
    font-size: 10px;
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  li {
    margin: 0;
    padding: 1px 0;
  }

  li > div {
    display: flex;
  }

  li > div > span {
    display: block;
    padding: 0 3px;
  }

  li > div > span:nth-child(1) {
    flex-grow: 1;
    text-align: right;
  }

  li > div > span:nth-child(2) {
    background: #555;
    color: #fff;
  }

  .isActiveGleis > div > span:nth-child(2) {
    background-color: red !important;
  }
</style>
