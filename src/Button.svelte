<script lang="ts">
  export let isActive: boolean = false;
  export let variant: 'plain' | 'normal' = 'normal';
  export let className: string = '';
  export let disabled: boolean = false;
</script>

<button
  class={`Button ` + (className ? className : '')}
  class:isActive
  class:normal={variant === 'normal'}
  class:plain={variant === 'plain'}
  {disabled}
  on:click
  on:mouseenter
  on:mouseleave><slot /></button
>

<style>
  .Button {
    color: #555;
    cursor: pointer;
    margin: var(--Button-margin, 1px);
  }
  .Button[disabled] {
    color: #ccc;
  }
  .isActive {
    font-weight: bold;
    border-color: #333;
  }
  .Button.normal {
    border: 1px solid #e3e3e3;
    background-color: #fefefe;
    border-radius: 2px;
    box-shadow: inset 0px 1px 0px 0px #ffffff;
    background: linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%);
    background-color: #ffffff;
    border: 1px solid #dcdcdc;
    text-shadow: 0px 1px 0px #ffffff;
  }
  .Button.plain {
    all: unset;
    color: #555;
    cursor: pointer;
    text-decoration: underline;
    margin: var(--Button-margin, 1px);
  }
  .Button:active {
    background: linear-gradient(to top, #ffffff 5%, #eee 100%);
  }
</style>
