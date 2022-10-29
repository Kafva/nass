<script lang="ts">
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
export let visible: boolean;
let passInput: string;


</script>

<form method="dialog">
  <div class="form-item">
    <label for="pass">Password:</label>
    <input type="password" bind:value={passInput} autocomplete="off" name="pass">
  </div>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <button class="nf nf-mdi-key_plus"
          on:click="{() => { visible = false } }"></button>
</form>

<style lang="scss">
@use "../scss/vars";


</style>



