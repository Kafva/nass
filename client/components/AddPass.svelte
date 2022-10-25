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

let generatePass = true
</script>

  <form method="dialog">
      <div>
        <label for="path">Path:</label>
        <input type="text" name="path" required>

        <label for="generate">Generate:</label>
        <input type="checkbox" name="generate" bind:checked={generatePass}>

        {#if !generatePass}
          <label for="pass">Password:</label>
          <input type="password" name="pass" required>

          <label for="verify">Verify:</label>
          <input type="password" name="verify" required>
        {/if}
      </div>

      <div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <button class="nf nf-mdi-keyboard_return"
                on:click="{() => ToggleDialog(dialog, cover, true)}" ></button>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <button class="nf nf-mdi-key_plus"
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
    input {
      font-size: vars.$font_medium;
      @include vars.input-style;
    }
  }

  & > div:nth-child(2) {
    grid-column-gap: 75px;
  }


  button {
    font-size: vars.$font_large;
    color: vars.$white;

    padding: 5px 0px 5px 0px;
    margin: 40px 0 10px 0;
    border-radius: 5%;
    
    // Spacing of buttons
    &:first-child {
      margin-right: 60%;
    }
    &:last-child {
      margin-left: 60%;
    }

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


