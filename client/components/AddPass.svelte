<script lang="ts">
import { ToggleDialog } from "../ts/util";
//  ____________________________
//  | Path: [....]              |
//  | Generate: [x]             |
//  | Password: [****]          |
//  | Confirm: [****]           |
//  |_____________________[OK]__|
//

export let cover: HTMLDivElement;
export let dialog: HTMLDialogElement;

</script>

  <form method="dialog">
      <div>
        <label for="path">Path: </label>
        <input type="text" name="path" required>

        <label for="generate">Generate? </label>
        <input type="checkbox" name="generate">

        <label for="pass">Password: </label>
        <input type="password" name="pass" required>

        <label for="verify">Verify: </label>
        <input type="password" name="verify" required>
      </div>

      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button class="nf nf-fa-close"
              on:click="{() => ToggleDialog(dialog, cover, true)}" ></button>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button class="nf nf-fa-arrow_right"
              on:click="{() => ToggleDialog(dialog, cover, true)}" ></button>
  </form>


<style lang="scss">
@use "../scss/vars";

form {

  div {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    label,input {
      margin-top: 10px;
    }
  }


  button {
    font-size: vars.$font_large;
    color: vars.$white;
    //width: 30px;
    //height: 30px;

    margin-top: 10px;
    //padding: 10px 20px 10px 20px;
    outline: 0;
    border: 0;

    &.nf-fa-close {
      background-color: vars.$red;
    }
    &.nf-fa-arrow_right {
      background-color: vars.$green;
    }

  }
}

</style>


