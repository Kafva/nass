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
    </div>

    <div>
      <label for="generate">Generate? </label>
      <input type="checkbox" name="generate">
    </div>

    <div>
      <label for="pass">Password: </label>
      <input type="password" name="pass" required>
    </div>

    <div>
      <label for="verify">Verify: </label>
      <input type="password" name="verify" required>
    </div>

    <div>
      <button class="nf nf-fa-close"
              on:click="{() => ToggleDialog(dialog, cover, true)}" ></button>
      <button class="nf nf-fa-arrow_right"
              on:click="{() => ToggleDialog(dialog, cover, true)}" ></button>
    </div>
  </form>


<style lang="scss">
@use "../scss/vars";

button.nf {
  font-size: vars.$font_large;
}

form {
  display: table;

  div {
    display: table-row;

    label,input {
      display: table-cell;
      margin-top: 10px;
    }
    label {
     padding-right: 10px;
    }

    button {
      display: table-cell;
      color: vars.$white;
      border: 0;
      margin: 5px;
      padding: 10px 20px 10px 20px;
      outline: 0;

      &.nf-fa-close {
        background-color: vars.$red;
      }
      &.nf-fa-arrow_right {
        background-color: vars.$green;
      }

    }

  }

}

</style>


