<script lang="ts">
  import Config from "../ts/config";
  import ApiRequest from "../ts/ApiRequest";
  import { authDialogForPath } from "../ts/store";
  import { CopyToClipboard } from "../ts/util";

  export let path: string;
  let passInput: string;
  const api = new ApiRequest()

  /**
   * Maybe not great to have an event listener for every keyboard event on
   * a password prompt...
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
    case "Enter":
      api.getPasswordWithAuth(path, passInput).then( (value:string) => {
        if (value != "") {
          CopyToClipboard(value)
        }
        authDialogForPath.set("")
      })
      break;
    }
  }
</script>

<form method="dialog">
  <label for="pass">
    Authentication required
  </label>

  <div>
    <span class="{Config.passwordPrompt}"/>
    <input type="password"
      on:keydown="{handleKeyDown}"
      bind:value={passInput}
      name="pass"
      autocomplete="off"
    >
  </div>
</form>

<style lang="scss">
  @use "../scss/vars";

  form {
    text-align: center;
    font-size: vars.$font_medium;
    display: grid;
    grid-template-columns: 1fr;
    padding: 10px 0px 10px 0px;

    div {
     span {
        font-size: vars.$font_large;
        margin: 0 8px 0 0;
      }
      input {
        @include vars.input-style();
        font-size: inherit;
      }
    }
  }
</style>

