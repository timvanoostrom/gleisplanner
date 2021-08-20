<script lang="ts">
  import dialogPolyfill from 'dialog-polyfill';
  import { afterUpdate, createEventDispatcher, onMount } from 'svelte';

  export let id: string;
  export let isOpen: boolean = false;
  export let modal: boolean = true;
  export let height: string = '400px';
  export let width: string = '260px';

  let dialog: HTMLDialogElement;
  const hasNativeDialogSupport = !!window.HTMLDialogElement;
  const dispatch = createEventDispatcher();

  onMount(() => {
    dialogPolyfill.registerDialog(dialog);
  });

  afterUpdate(() => {
    if (isOpen && !dialog.hasAttribute('open')) {
      if (modal) {
        dialog.showModal();
      } else {
        dialog.show();
      }
    }
  });

  const onClose = (event) => {
    isOpen = false;
    dispatch('close', {
      foo: 'bar',
    });
  };
</script>

<dialog
  class:fixed={!hasNativeDialogSupport}
  bind:this={dialog}
  {id}
  on:close={(event) => onClose(event)}
  style={`height: ${height};width: ${width}`}
>
  <slot />
</dialog>

<style>
  dialog {
    position: absolute;
    left: 0;
    right: 0;
    width: -moz-fit-content;
    width: -webkit-fit-content;
    width: fit-content;
    height: -moz-fit-content;
    height: -webkit-fit-content;
    height: fit-content;
    margin: auto;
    border: solid;
    padding: 1em;
    background: white;
    color: black;
    display: block;
  }

  dialog:not([open]) {
    display: none;
  }

  :global(dialog + .backdrop) {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  :global(._dialog_overlay) {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .fixed {
    position: fixed;
    top: 50%;
    transform: translate(0, -50%);
  }

  :global(dialog + .backdrop),
  dialog::backdrop {
    /* native */
    background-color: var(--dialog-backdrop, rgba(0, 0, 0, 0.1));
  }

  :global(dialog .DialogCloseButton) {
    position: absolute;
    right: 2px;
    top: 2px;
  }
</style>
