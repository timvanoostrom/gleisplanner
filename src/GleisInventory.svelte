<script lang="ts">
  import { trackLibByArtNr } from './config/trackLib';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { gleisPlanned } from './store/gleis';

  let inventory: Record<string, number> = {};
  let total = 0;
  let totalqty = 0;

  $: {
    inventory = {};
    total = 0;
    totalqty = 0;

    for (const gleis of Object.values($gleisPlanned)) {
      if (!inventory[gleis.artnr]) {
        inventory[gleis.artnr] = 0;
      }
      inventory[gleis.artnr] += 1;
      totalqty += 1;
    }

    for (const [artnr, count] of Object.entries(inventory)) {
      total += inventory[artnr] * $trackLibByArtNr[artnr].price || 0;
    }
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
      {#each Object.entries(inventory) as [artNr, count]}
        <tr>
          <td>{count} x</td>
          <td>{$trackLibByArtNr[artNr].title}</td>
          <td>{artNr}</td>
          <td>
            {(count * $trackLibByArtNr[artNr].price || 0).toFixed(2)}
          </td>
          <td>{$trackLibByArtNr[artNr].brand}</td>
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
