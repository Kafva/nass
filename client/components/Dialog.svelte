<script lang="ts">
import type { SvelteComponent } from "svelte";
import { fly } from '../ts/util';

// The component to render inside of the modal
export let component: typeof SvelteComponent;
export let cover: HTMLDivElement;
export let btnClass: string;
let visible = false;

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
  case "Escape":
    visible = false
    cover.hidden = true;
    break;
  }
}
</script>

<svelte:window on:keydown="{(e) => handleKeyDown(e)}"/>

{#if visible}
  <div transition:fly="{{ vh: 10, duration: 400 }}">
    <svelte:component this={component} visible={visible} cover={cover}/>
  </div>
{/if}

<!-- Some dialogs (like the password prompt) do  not need activation button -->
{#if btnClass != ""}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span role="button" class="{'nf '+ btnClass}"
        on:click="{() => { visible = true; cover.hidden = false; } }"></span>
{/if}

<style lang="scss">
@use "../scss/vars";

div {
  position: fixed;
  z-index: vars.$dialog_z;
  background-color: #20252c;
  color: vars.$white;
  opacity: 1.0;
  padding: 15px;
  border: 1px solid vars.$lilac;
  border-radius: 5%;

  // Position the dialog off-screen by default, the `fly`
  // animation will move it into place.
  top: -5vh;
}

// Buttons float to the corner
span.nf {
  font-size: vars.$font_large;
  float: right;
  margin: 10px 15px 0 0;

  &:hover {
    color: vars.$lilac;
  }
}

</style>
