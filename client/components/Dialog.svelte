<script lang="ts">
import type { SvelteComponent } from "svelte";
import { ToggleDialog } from "../ts/util";

// The component to render inside of the dialog
export let component: typeof SvelteComponent;
export let cover: HTMLDivElement;
export let btnClass: string;
let dialog: HTMLDialogElement;


const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
  case "Escape":
        ToggleDialog(dialog, cover, true)
        break;
  }
}
</script>

<svelte:window on:keydown="{(e) => handleKeyDown(e)}"/>

<dialog bind:this={dialog}>
  <svelte:component this={component} dialog={dialog} cover={cover}/>
</dialog>

{#if btnClass != ""}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<span role="button" class="{'nf '+ btnClass}"
      on:click="{() => ToggleDialog(dialog, cover, false)}"></span>
{/if}

<style lang="scss">
@use "../scss/vars";

dialog {
  position: fixed;
  z-index: vars.$dialog_z;
  background-color: vars.$grey;
  color: vars.$white;
  opacity: 1.0;
  border-color: vars.$lilac;
  border-radius: 5%;
}

span.nf {
  font-size: vars.$font_large;

  // Help button
  &.nf-mdi-help {
    // float: left;
    margin: 0px 0 0 10px;
  }
}

</style>

