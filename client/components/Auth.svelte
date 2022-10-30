<script lang="ts">
import Config from "../ts/config";
import { authDialogForPath, msgText } from "../ts/store";
import { MessageText, ApiStatusResponse } from '../ts/types';
import type { ApiResponse } from '../ts/types';

export let path: string;
let passInput: string;

const authRequest = async (path: string) => {
  try {
    const res = await fetch(`/get?path=${path.slice(1)}`, {
      method: 'POST',
      body: `pass=${passInput}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
    try {
      const apiRes = (await res.json()) as ApiResponse

      switch (apiRes.status) {
      case ApiStatusResponse.success:
        try {
          await navigator.clipboard.writeText(apiRes.value)
          msgText.set([MessageText.clipboard, ""])
        } catch (err) {
          msgText.set([MessageText.err, "failed to access clipboard"])
          console.error(err)
        }
        break;
      default:
        msgText.set([MessageText.err,`${res.status}: '${apiRes.desc}'`])
      }
    } catch (err) {
      msgText.set([MessageText.err, "parsing response"])
      console.error(err)
    }
  } catch (err) {
    msgText.set([MessageText.err,`fetching '${path}'`])
    console.error(err)
  }
}

/**
 * Maybe not great to have an event listener for every keyboard event on
 * a password prompt...
 */
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
  case "Enter":
    authRequest(path)
    authDialogForPath.set("")
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



