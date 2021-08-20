<script lang="ts">
  import { icon } from './lib/far-icons';
  import type { IconName } from './lib/far-icons';

  export let name: IconName;
  export let size: number = 16;
  export let color: string = '#000000';
</script>

<span class="Icon" style={`font-size: ${size}px;color:${color}`}>
  {@html icon(name, size)}
</span>

<style>
  .Icon {
    font-family: 'Font Awesome 5 Free';
    font-weight: 400;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    display: inline-block;
    font-style: normal;
    font-variant: normal;
    text-rendering: auto;
    line-height: 1;
  }
</style>
