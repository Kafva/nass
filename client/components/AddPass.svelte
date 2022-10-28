<script lang="ts">
//   ___________________________
//  | Path: [....]              |
//  | Generate: [x]             |
//  | Password: [****]          |
//  | Confirm: [****]           |
//  |_____________________[OK]__|
//

export let visible: boolean;
export let cover: HTMLDivElement;

let generatePass = true
let passInput: string;
let verifyInput: string;

</script>

<form>
  <div>
    <label for="path">Path:</label>
    <input spellcheck="false" type="text" name="path">

    <label for="generate">Generate:</label>
    <input type="checkbox" name="generate" bind:checked={generatePass}>

    {#if !generatePass}
      <label for="pass">Password:</label>
      <input type="password" bind:value={passInput} name="pass">

      <label for="verify">Verify:</label>
      <input type="password" bind:value={verifyInput}
             name="verify"
             style:border-color="{
               passInput == verifyInput && passInput != '' ? 'green' : 'red'
             }"
      >
    {/if}
  </div>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <button class="nf nf-mdi-key_plus"
          on:click="{() => { visible = false; cover.hidden = true; } }" ></button>
</form>

<style lang="scss">
@use "../scss/vars";

form {
  text-align: center;

  div {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    label,input {
      margin-top: 10px;
      // Fade-in for explicit password entry
      &:not(first-child) {
        @include vars.fade-in;
      }
    }
    input {
      font-size: vars.$font_medium;
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
    background-color: #404795;

    &:hover {
      border-color: vars.$pink;
    }

  }
}

</style>
