<script lang="ts">
  import { guideStyles, round } from './helpers/app';
  import { selectedGuideId } from './store/workspace';
  import type { Guide } from './types';

  export let guide: Guide;
  export let noselect: boolean = false;
</script>

<rect
  x={guide.points[0].x}
  y={guide.points[0].y}
  width={guide.width}
  height={guide.height}
  class="GuideShape"
  class:isSelected={!noselect && guide.id === $selectedGuideId}
  transform={guide.transform}
  style={guideStyles(guide)}
  on:click
/>
<text
  class="SizeLabel"
  transform={guide.transform}
  x={guide.points[0].x + guide.width / 2}
  y={guide.points[0].y + guide.height / 2}
>
  {round(guide.width || 0, 0)}x{round(guide.height || 0, 0)}
</text>

<style>
  .GuideShape {
    fill: rgba(255, 130, 130, 1);
  }
  .SizeLabel {
    font-size: 10px;
    text-anchor: middle;
  }
  .isSelected {
    stroke: red;
    stroke-width: 5px;
    stroke-opacity: 0.7;
  }
</style>
