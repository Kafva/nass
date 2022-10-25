<script lang="ts">
import Config from "../ts/config";
import { GetHTMLElement, ToggleDialog } from "../ts/util";

//  ____________________________
//  | Password entry:           |
//  | [*************]           |
//  |_____________________[OK]__|
//
// Generate needs to relay a second message back
//  ____________________________
//  | Generated passsword:      |
//  | [.............]           |
//  |_____________________[OK]__|

import AddPass from "./AddPass.svelte";


// This element is mounted outside the svelte #root
const cover = GetHTMLElement<HTMLDivElement>(`#${Config.modalCoverId}`)
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

<dialog bind:this="{dialog}">
  <AddPass dialog="{dialog}" cover={cover}/>
</dialog>

<!--
    svelte-ignore a11y-click-events-have-key-events
    Elements lack intractability with Vimium if we use .showModal()
-->
<span role="button" class="nf nf-fa-plus"
      on:click="{() => ToggleDialog(dialog, cover, false)}"></span>


<style lang="scss">
@use "../scss/vars";

span.nf {
  font-size: vars.$font_large;
}

dialog {
  position: fixed;
  z-index: vars.$dialog_z;
  background-color: vars.$grey;
  color: vars.$white;
  opacity: 1.0;
  border-color: vars.$accent;
  border-radius: 5%;
}

</style>

