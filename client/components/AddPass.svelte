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
let passInput: HTMLInputElement;
let verifyInput: HTMLInputElement;

</script>

  <form method="dialog">
      <ul>
        <li>Latin alphanumerics and <code>[-_.@/]</code> are allowed in path names.</li>
        <li><code>'/'</code> can be used to create folders.</li>
      </ul>

      <div>
        <label for="path">Path:</label>
        <input spellcheck="false" type="text" name="path" required>

        <label for="generate">Generate:</label>
        <input type="checkbox" name="generate" bind:checked={generatePass}>

        {#if !generatePass}
          <label for="pass">Password:</label>
          <input type="password" bind:this={passInput} name="pass" required>

          <label for="verify">Verify:</label>
          <input type="password" bind:this={verifyInput} name="verify" required>
          {#if passInput && verifyInput && 
              passInput.value == verifyInput.value && passInput.value != "" }
            <span class="nf nf-fa-check"/>
          {:else}
            <span class="nf nf-fa-close"/>
          {/if}
        {/if}
      </div>

      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button class="nf nf-mdi-key_plus"
              on:click="{() => ToggleDialog(dialog, cover, true)}" ></button>
  </form>


<style lang="scss">
@use "../scss/vars";

form {
  text-align: center;

  ul {
    list-style-type: disc;
    font-size: vars.$font_small;
    display: inline-block;
    width: 20vw;
    text-align: left;
    background-color: vars.$black;
    opacity: 0.9;
    border-radius: 0%;
    border: 1px dotted;
    border-color: vars.$white;
    padding: 10px;
    li {
      margin-left: 20px;
    }
  }

  // Grid container
  div {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    label,input,span {
      margin-top: 10px;
      // Fade-in for explicit password entry
      &:not(first-child) {
        @include vars.fade-in;
      }
    }
    span {
      display: inline-block;
      &.nf-fa-close {
        color: vars.$red;
      }
    }
    input {
      font-size: vars.$font_medium;
      padding: 5px 2px 5px 2px;
      @include vars.input-style;
    }
    
  }

  button {
    font-size: vars.$font_large;
    color: vars.$white;

    padding: 5px 0px 5px 0px;
    margin: 40px 0 10px 0;
    border-radius: 5%;
    width: 80px;
    
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


