<script lang="ts">
  import { authInfoStore, showPassStore, msgTextStore } from "../ts/store";
  import { SupportsClipboardWrite, Debug, Err } from "../ts/util";
  import type { ApiResponse, PassItem  } from '../ts/types';
  import { Config, MessageText } from "../ts/config";
  import { ApiStatusResponse  } from "../ts/types";
  import ApiRequest from "../ts/ApiRequest";

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

          if ($authInfoStore.useClipboard && SupportsClipboardWrite()) {
            navigator.clipboard.writeText(apiRes.value).then( () =>
              msgTextStore.set([MessageText.clipboard, ""])
            ).catch( e => {
              msgTextStore.set([MessageText.err, (e as Error).message])
            })
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

<form autocomplete="off" method="dialog">
  <label for="pass">
    Authentication required
  </label>

  <div>
    <span class="nf {Config.passwordPrompt}"/>
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

