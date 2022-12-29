<script lang="ts">
  import { authInfoStore, showPassStore, visibleButtonsStore } from '../ts/store';
  import { fade, fly } from '../ts/util';
  import type { SvelteComponent } from "svelte";

  // The component to render inside of the modal
  export let component: typeof SvelteComponent
  export let btnClass: string
  // Top offset after `fly`
  export let percent: number
  export let dialogClass = ""
  export let title = ""

  let visible = false

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

  <div id="dialog" class="{dialogClass}"
       transition:fly="{{ percent: percent, duration: 400 }}">
    <!-- bind: is used to have the parent react to any changes that
    the child makes to 'visible' -->
    <svelte:component this={component} bind:visible={visible}/>
  </div>
{/if}

<!-- Some dialogs (like the password prompt) do not need an activation button -->
{#if btnClass != ""}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span role="button" class="{'nf '+ btnClass}"
        title="{title}"
        on:click="{() => {
          visible = true
          visibleButtonsStore.set('')
  }}"/>
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
    overflow: hidden;
    overflow-wrap: anywhere;
    position: fixed;
    z-index: vars.$dialog_z;
    background-color: vars.$dialog_bg;
    color: vars.$white;
    padding: $dialog_padding;

    // Override for <ShowPass/>
    border: 1px solid vars.$lilac;
    border-radius: 5%;

    &.show-pass {
        border: 5px solid vars.$lilac;
        border-radius: 0%;
    }

    width: vars.$dialog_width;

    // Position the dialog off-screen by default, the `fly`
    // animation will move it into place.
    top: -5%;

    @include vars.fixed-centering(vars.$dialog_width, $dialog_padding);

    // == Small mobile displays ==
    @include vars.tiny-mobile {
        font-size: vars.$font_small;
        width: vars.$dialog_width_tiny_mobile;
        margin-left: 8%;
        height: fit-content;
        max-height: calc(vars.$tiny_mobile_max_height - 180px);
        overflow-x: hidden;
        overflow-y: scroll;
    }
}

// Buttons float to the corner
span.nf {
    @include vars.button-style;
    @include vars.mobile {
        font-size: vars.$font_icon_high_mobile;
    }
}
</style>
