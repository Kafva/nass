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

  const hideAuth = () => {
    // Hide the <Auth/> dialog after successful authentication
    authInfoStore.set({path: "", useClipboard: false})
    visible = false
  }

  const handleRequest = async (): Promise<string> => {
    return api.getPass($authInfoStore.path, passInput).then( (apiRes: ApiResponse) => {
      if (apiRes.status == ApiStatusResponse.success ) {
        Debug("Authentication successful: ", apiRes)

        if ($authInfoStore.useClipboard && SupportsClipboardWrite()) {
           return Promise.resolve(apiRes.value)
        } else {
          showPassStore.set({
            path: $authInfoStore.path,
            password: apiRes.value
          } as PassItem)

          hideAuth()
        }

      } else {
        Err("Error", apiRes.desc)
      }
      return Promise.resolve("")
    })
  }

  // Wrapper for WebKit compatible clipboard writing
  //  https://webkit.org/blog/10855/async-clipboard-api/
  const handleKeyDown = (event: KeyboardEvent) => {
     if (event.key == 'Enter') {
       const textItem = new ClipboardItem({"text/plain": handleRequest()})
       // Do not overwrite the clipboard with an empty string
       if ($authInfoStore.useClipboard) {
         navigator.clipboard.write([textItem])
          .then(() => {
            msgTextStore.set([MessageText.clipboard, ""])
            hideAuth()
          })
          .catch(e => {
            msgTextStore.set([MessageText.err, (e as Error).message])
         })
       }

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

