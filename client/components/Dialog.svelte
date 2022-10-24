<script lang="ts">
// The dialog needs to support:
//  ____________________________
//  | Path: [....]              | 
//  | Generate: [x]             | 
//  | Password: [****]          | 
//  | Confirm: [****]           | 
//  |_____________________[OK]__|
//  
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

let dialog: HTMLDialogElement;
</script>

<dialog bind:this="{dialog}">
  <form method="dialog">
    <h1>hey</h1>
    <div>
      <button value="cancel">Cancel</button>
      <button id="confirmBtn" value="default">Confirm</button>
    </div>
  </form>
</dialog>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span role="button" class="nf nf-fa-plus" on:click="{ () => dialog.showModal() }"></span>


<style lang="scss">
@use "../scss/vars";

span.nf {
  font-size: vars.$font_large;
}

dialog {
  background-color: vars.$grey;
  color: vars.$white;
  border-color: vars.$accent;
  border-radius: 5%;

  button {
    border: 0;
    outline: 0;
  }

}

</style>

