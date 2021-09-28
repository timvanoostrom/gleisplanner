<script lang="ts">
  import Button from './Button.svelte';
  import {
    activeTrackLibId,
    trackLibById,
    trackLibByCategory,
    trackLibs,
    setTrackLibQuickSelect,
    trackLibQuickSelect,
    setActiveTrackLibId,
  } from './config/trackLib';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { protoGleisIdActive } from './store/gleis';

  const [activeProtoGleisId, setActiveProtoGleisId] = protoGleisIdActive;

  function selectTrack(type, id) {
    setActiveProtoGleisId(id);
    setTrackLibQuickSelect((trackLibQuickSelect) => {
      return {
        ...trackLibQuickSelect,
        [type]: id,
      };
    });
  }

  function onKeydownRouter(event) {
    if ($trackLibQuickSelect) {
      const trackEntriesQuickSelect = Object.entries($trackLibQuickSelect);
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
        if (trackEntriesQuickSelect[parseInt(event.key, 10) - 1]) {
          let [type, id] = trackEntriesQuickSelect[parseInt(event.key, 10) - 1];
          if ($activeProtoGleisId === id) {
            const gleisType = $trackLibByCategory.find(
              ([trackType]) => trackType === type
            );
            const currentIndex = gleisType[1].findIndex(
              (gleis) => gleis.id === id
            );
            if (event.shiftKey) {
            } else {
              id = gleisType[1][currentIndex + 1]?.id || gleisType[1][0].id;
            }
          }
          selectTrack(type, id);
        }
      }
    }
  }
</script>

<svelte:window on:keydown={onKeydownRouter} />

<div class="TrackLibControl">
  <select
    on:input={(event) => {
      setActiveTrackLibId(event.currentTarget.value);
    }}
    value={$activeTrackLibId}
  >
    {#each Object.entries($trackLibs) as [id, trackLib] (id)}
      <option value={id}>{trackLib.title}</option>
    {/each}
  </select>
  {#each $trackLibByCategory as [category, gleisConfigs]}
    <div class="TrackLibCategory">
      <ControlMenuPanel title={category} dropdown={true}>
        <div slot="header-right">
          {#if $trackLibQuickSelect && $trackLibQuickSelect[category]}
            <Button
              isActive={$activeProtoGleisId === $trackLibQuickSelect[category]}
              on:click={() => {
                setActiveProtoGleisId($trackLibQuickSelect[category]);
              }}>{$trackLibById[$trackLibQuickSelect[category]]?.title}</Button
            >
          {/if}
        </div>
        <div class="TrackButtons">
          {#each gleisConfigs as gleisConfig}
            <Button
              on:click={() => {
                selectTrack(category, gleisConfig.id);
              }}
              isActive={$activeProtoGleisId === gleisConfig.id}
              >{gleisConfig.title}</Button
            >
          {/each}
        </div>
      </ControlMenuPanel>
    </div>
  {/each}
</div>

<style>
  .TrackLibControl {
    display: flex;
    justify-content: left;
    margin-bottom: 10px;
  }
  .TrackLibCategory {
    margin: 0 2px;

    --ControlMenuPanel-display: inline-block;
  }
  .TrackButtons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
  }
</style>
