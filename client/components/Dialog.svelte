<script lang="ts">
  import { authInfoStore, showPassStore, visibleButtonsStore } from '../ts/store';
  import { fade, fly } from '../ts/util';
  import type { SvelteComponent } from "svelte";

  // The component to render inside of the modal
  export let component: typeof SvelteComponent;
  export let btnClass: string;

  let visible = false;

  /**
   * Clear all stores related to a dialog and disable the local
   * visibility flag.
   */
  const hideDialog = () => {
    authInfoStore.set({path: "", useClipboard: false})
    showPassStore.set({path: "", password: ""})
    visible = false
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
    case "Escape":
      hideDialog()
      break;
    }
  }
</script>

<svelte:window on:keydown="{handleKeyDown}"/>

<!-- The <App/> controls if dialogs without a button should be visible -->
{#if visible || btnClass == ""}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="modalCover" transition:fade="{{ limit: 0.5, duration: 400 }}"
       on:click="{hideDialog}"/>

  <div id="dialog" transition:fly="{{ vh: 10, duration: 400 }}">
    <!-- bind: is used to have the parent react to any changes that
    the child makes to 'visible' -->
    <svelte:component this={component} bind:visible={visible}/>
  </div>
{/if}

<!-- Some dialogs (like the password prompt) do not need an activation button -->
{#if btnClass != ""}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span role="button" class="{'nf '+ btnClass}"
        on:click="{() => { 
          visible = true 
          visibleButtonsStore.set("")
  }}"></span>
{/if}

<style lang="scss">
  @use "../scss/vars";

  $dialog_padding: 15px;

  div#modalCover {
    z-index: vars.$cover_z;
    position: fixed;
    left:0;
    top:0;
    width: 100vw;
    height: 100vh;
    background-color: vars.$black;
  }

  div#dialog {
    position: fixed;
    z-index: vars.$dialog_z;
    background-color: vars.$dialog_bg;
    color: vars.$white;
    padding: $dialog_padding;
    border: 1px solid vars.$lilac;
    border-radius: 5%;
    width: vars.$dialog_width;

    // Position the dialog off-screen by default, the `fly`
    // animation will move it into place.
    top: -5vh;

    @include vars.fixed-centering(vars.$dialog_width, $dialog_padding);
  }

  // Buttons float to the corner
  span.nf {
    @include vars.button-style;
  }
</style>
