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

<!-- Some dialogs (like the password prompt) do  not need activation button -->
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
  background-color: #20252c;
  color: vars.$white;
  opacity: 1.0;
  border-color: vars.$lilac;
  border-radius: 5%;
}

// Buttons float to the corner
span.nf {
  font-size: vars.$font_large;
  float: right;
  margin: 5px 15px 0 0;

  &:hover {
    color: vars.$lilac;
  }
}

</style>

