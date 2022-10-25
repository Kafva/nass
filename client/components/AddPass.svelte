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

      <div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <button class="nf nf-fa-close"
                on:click="{() => ToggleDialog(dialog, cover, true)}" ></button>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <button class="nf nf-fa-arrow_right"
                on:click="{() => ToggleDialog(dialog, cover, true)}" ></button>
      </div>
  </form>


<style lang="scss">
@use "../scss/vars";

form {

  // Grid container
  div {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    label,input {
      margin-top: 10px;
    }
  }

  & > div:nth-child(2) {
    grid-column-gap: 75px;
  }


  button {
    font-size: vars.$font_large;
    color: vars.$white;

    // width: fit-content;
    //padding: 10px 20px 10px 20px;
    //margin: 20px 30px 10px 30px;
    padding: 10px 0px 10px 0px;

    // todo margin right for left only and vice versa

    outline: 0;
    border: solid 2px;
    border-color: rgba(0,0,0,0.0);

    background-color: #404795;

    &:hover {
      border-color: vars.$pink;
    }

  }
}

</style>


