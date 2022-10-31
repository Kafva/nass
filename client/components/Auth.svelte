<script lang="ts">
  import Config from "../ts/config";
  import ApiRequest from "../ts/ApiRequest";
  import { ApiStatusResponse } from "../ts/types";
  import type { ApiResponse } from '../ts/types';
  import { authDialogForPath } from "../ts/store";

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
      api.getPass(path, passInput).then( (apiRes: ApiResponse) => {
        if (apiRes.status == ApiStatusResponse.success ) {
          // We need to know if the initial keypress targeted the 'eye'
          // button or the clipboard
          // TODO
          console.log("Now authenticated: ", apiRes.value)
          authDialogForPath.set("")
        } else {
          console.error("Error", apiRes.desc)
        }
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

