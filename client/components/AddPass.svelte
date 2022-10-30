<script lang="ts">
import { fade } from '../ts/util';
export let visible: boolean;

let generatePass = true
let passInput: string;
let verifyInput: string;

</script>

<form method="dialog" autocomplete="off">
  <div class="form-item">
    <label for="path">Path:</label>
    <input spellcheck="false" type="text" name="path">

    <label for="generate">Generate:</label>
    <input type="checkbox" name="generate" bind:checked={generatePass}>
  </div>

  {#if !generatePass}
  <div class="form-item" transition:fade="{{ limit: 1.0, duration: 400 }}">
    <label for="pass">Password:</label>
    <input type="password" bind:value={passInput} name="pass">

    <label for="verify">Verify:</label>
    <input type="password" bind:value={verifyInput}
           name="verify"
           style:border-color="{
              verifyInput ?
                (passInput == verifyInput && passInput != '' ? 'green' : 'red') :
                'transparent'
           }"
    >
  </div>
  {/if}

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <button class="nf nf-mdi-key_plus"
          on:click="{() => { visible = false } }"></button>
</form>

<style lang="scss">
@use "../scss/vars";

form {
  text-align: center;

  div.form-item {
    font-size: vars.$font_small;
    display: grid;
    grid-template-columns: 0.5fr 1fr;
    label,input {
      margin-top: 10px;
    }
    input {
      padding: 5px 2px 5px 2px;
      @include vars.input-style;

      &[name="verify"] {
          border-bottom: 2px solid;
          border-color: transparent;
      }
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
    background-color: vars.$button_bg;

    &:hover {
      border-color: vars.$pink;
    }

  }
}

</style>
