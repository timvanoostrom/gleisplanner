<script lang="ts">
  import { trackLibByArtNr } from './config/trackLib';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { calculateTrackLengthCM } from './helpers/geometry';
  import { gleisPlanned } from './store/gleis';
  import type { ProtoGleis, TrackLib } from './types';

  let inventory: Record<string, number> = {};
  let inventoryItems: Array<[string, number, ProtoGleis & { brand: string }]> =
    [];
  let total = 0;
  let totalqty = 0;

  $: {
    inventory = {};
    total = 0;
    totalqty = 0;

    const flexIndex: Record<string, number> = {};

    for (const gleis of Object.values($gleisPlanned)) {
      const protoGleis = $trackLibByArtNr[gleis.artnr];

      if (!inventory[gleis.artnr]) {
        inventory[gleis.artnr] = 0;
      }

      if (protoGleis.type === 'Flex') {
        if (!flexIndex[gleis.artnr]) {
          flexIndex[gleis.artnr] = 0;
        }
        const lenCM = gleis?.pathSegments
          ? calculateTrackLengthCM(
              gleis.pathSegments.find((segment) => segment.type === 'main')
            )
          : 0;

        flexIndex[gleis.artnr] += lenCM;
      } else {
        inventory[gleis.artnr] += 1;
      }
    }

    for (const [artnr, lenCM] of Object.entries(flexIndex)) {
      const protoGleis = $trackLibByArtNr[artnr];
      const count = lenCM / (protoGleis.segments[0].length / 10);

      inventory[artnr] = Math.round(count);
    }

    for (const [artnr, count] of Object.entries(inventory)) {
      totalqty += count;
      total += inventory[artnr] * ($trackLibByArtNr[artnr].price || 0);
    }

    inventoryItems = Object.entries(inventory).map(([artnr, count]) => [
      artnr,
      count,
      $trackLibByArtNr[artnr],
    ]);
  }
</script>

<ControlMenuPanel
  title="Inventory"
  flex={false}
  startMinimized={true}
  toggle={true}
>
  <div class="InventoryContent">
    <table class="inventoryTable">
      {#each inventoryItems as [artNr, count, protoGleis]}
        <tr>
          <td>{count} x</td>
          <td>{protoGleis.title}</td>
          <td>{artNr}</td>
          <td>
            {(count * protoGleis.price || 0).toFixed(2)}
          </td>
          <td>{protoGleis.brand}</td>
        </tr>
      {/each}
      <tr><td colspan="4">Total</td></tr>
      <tr><td colspan="3">{totalqty}</td><td>{total}</td></tr>
    </table>
  </div>
</ControlMenuPanel>

<style>
  .price {
    float: right;
    margin-left: 20px;
  }
  .InventoryContent {
    max-height: 200px;
    overflow-y: auto;
  }
  .inventoryTable {
    width: 100%;
  }
</style>
