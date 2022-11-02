<script lang="ts">
  import { Config } from "../ts/config";
  import ApiRequest from "../ts/ApiRequest";
  import { ApiStatusResponse } from "../ts/types";
  import type { ApiResponse, PassItem } from '../ts/types';
  import { authInfoStore, showPassStore } from "../ts/store";
  import { CopyToClipboard, Debug, Err } from "../ts/util";

  export let visible: boolean;
  const api = new ApiRequest()
  let passInput: string;

  /**
   * Maybe not great to have an event listener for every keyboard event on
   * a password prompt...
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
    case "Enter":
      api.getPass($authInfoStore.path, passInput).then( (apiRes: ApiResponse) => {
        if (apiRes.status == ApiStatusResponse.success ) {
          Debug("Authentication successful: ", apiRes)

          if ($authInfoStore.useClipboard) {
            CopyToClipboard(apiRes.value)
          } else {
            showPassStore.set({
              path: $authInfoStore.path,
              password: apiRes.value
            } as PassItem)
          }

          // Restore the passInfo store...
          authInfoStore.set({path: "", useClipboard: false})
          // ...and close the outer <Dialog/>
          visible = false

        } else {
          Err("Error", apiRes.desc)
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

