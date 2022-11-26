<script lang="ts">
  import ApiRequest from '../ts/ApiRequest';
  import { Config, MessageText, passentryRegex, passwordRegex } from '../ts/config';
  import { msgTextStore, rootEntryStore } from '../ts/store';
  import { ApiStatusResponse } from '../ts/types';
  import type { ApiResponse } from '../ts/types';
  import { fade, IsLikelySafari, IsMobile } from '../ts/util';
  export let visible: boolean;

  export let generatePass = true // This is allowed as a prop to simplify tests
  let suggestElement: HTMLSpanElement
  let pathInputElement: HTMLInputElement
  let pathInput: string
  let passInput: string
  let verifyInput: string
  const api = new ApiRequest()
  const safari = IsLikelySafari()
  const suggestFallback = "..."

  const validateSubmit = () => {
    // Automatically remove trailing and leading '/'
    const path = pathInput.replace(/^\//, "").replace(/\/$/, "")
    const pathMsg = pathIsValid(path)
    const passMsg = passwordIsValid()

    if (pathMsg != MessageText.valid) {
      msgTextStore.set([pathMsg, ""])
    } else if (!generatePass && passMsg != MessageText.valid) {
      msgTextStore.set([passMsg, ""])
    } else {
      // Conditions met at this point:
      //  * Path is valid
      //  * generatePass is set OR the password+verification is valid
      api.addPass(path, passInput, generatePass).then( (apiRes: ApiResponse) => {
        if (apiRes.status == ApiStatusResponse.success) {
          msgTextStore.set([MessageText.added, path])
          const newTree = $rootEntryStore.updateTree(path, false)
          rootEntryStore.set(newTree)
          visible = false
        } // Errors are handled internally by `api`
      })
    }
  }

  /**
   * Verify that the path only contains allowed characters,
   * Is not nested to deep and does not already exist.
   * Returns MessageText.valid on success.
   * The patterns here match the corresponding server validation.
   */
  const pathIsValid = (path: string): MessageText => {
    const depth = (Array.from(path.matchAll(/\//g)) || []).length

    if (path.match(passentryRegex) == null ||
        path.includes("//") ||
        path.includes(".gpg") ||
        path.includes("..") ||
        path.includes("/.") ||
        path.includes("./")) {
      return MessageText.invalidPath
    } else if (depth > Config.maxPassDepth) {
      return MessageText.invalidNesting
    } else if ($rootEntryStore.pathHasOverlap(path)) {
      // This check is the main reason why the rootEntry needs to be
      // globally available.
      return MessageText.pathOverlap
    }
    return MessageText.valid
  }

  /**
   * Verify that the password and verify inputs match and
   * only contain allowed characters.
   * Returns MessageText.valid on success.
   */
  const passwordIsValid = (): MessageText => {
    if (passInput == null) {
      return MessageText.invalidPass
    } else if (passInput.match(passwordRegex) == null) { // Dissallows ""
      return MessageText.invalidPass
    } else if (passInput != (verifyInput || "")) { // passInput is valid
      return MessageText.invalidVerify
    }
    return MessageText.valid
  }

/**
  * Update the suggestion <span/> with matches from the tree based
  * on user input to the path <input/>.
  */
  const keyUp = () => {
    // Clear placeholder when the input is empty
    if (pathInput == null || pathInput == "") {
      suggestElement.innerText = suggestFallback
      return
    }

    let match = suggestFallback
    for (const subpath of $rootEntryStore.subpaths) {
      // Limit the autocomplete matching to non-leaf nodes
      // Paths entered with a leading slash will not get autocompletion
      if (!subpath.includes("/")) { continue; }

      const nonLeaf = subpath.slice(0, subpath.lastIndexOf('/'))
      // Use the first match
      if (pathInput.startsWith(nonLeaf) || nonLeaf.startsWith(pathInput)) {
        match = nonLeaf
        break
      }
    }
    suggestElement.setAttribute("data-match", match)
    suggestElement.innerText = match != suggestFallback ?
      match + "/" + suggestFallback :
      suggestFallback
  }

  const keyDown = (event: KeyboardEvent) => {
    switch (event.key) {
    case 'Enter':
      event.preventDefault()
      validateSubmit()
      // Force unfocus on enter, this is required on mobile
      // since the keyboard will otherwise obscure alerts
      if (IsMobile()) {
        (event.target as HTMLInputElement).blur()
      }
      break;
    // Auto-complete in path input
    case 'Tab':
    case 'ArrowRight':
      if ((event.target as HTMLInputElement).name == "path") {
        const suggestion = suggestElement.getAttribute("data-match")
        if (suggestion != null &&
            suggestion.length > pathInputElement.value.length) {
          event.preventDefault()
          pathInputElement.value = suggestion
        }
      }
    }
  }
</script>


<span class="suggest nf {Config.suggestIcon}"
      bind:this="{suggestElement}">{suggestFallback}</span>
<form method="dialog" autocomplete="off" on:submit|preventDefault={validateSubmit}>
  <div class="form-item">
    <label for="path">Path:</label>
    <div>
      <input spellcheck="false" autocapitalize="off" autocorrect="off" type="text" name="path"
             bind:value={pathInput}
             bind:this="{pathInputElement}" on:keydown={keyDown} on:keyup={keyUp}>
    </div>

    <label for="generate">Generate:</label>
    <input type="checkbox" name="generate" bind:checked={generatePass}
           class:safari={safari}>
  </div>

  {#if !generatePass}
  <div class="form-item" transition:fade="{{ limit: 1.0, duration: 400 }}">
    <label for="pass">Password:</label>
    <input type="password" bind:value={passInput} name="pass" on:keydown={keyDown}>

    <label for="verify">Verify:</label>
    <input type="password" bind:value={verifyInput}
           name="verify"
           style:border-color="{
              verifyInput ?
                (passInput == verifyInput && passInput != '' ? 'green' : 'red') :
                'transparent'
           }"
           on:keydown={keyDown}
    >
  </div>
  {/if}

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <button class="nf nf-mdi-key_plus"
          on:click="{validateSubmit}"></button>
</form>

<style lang="scss">
  @use "../scss/vars";

  span.suggest {
    display: inline-block;
    overflow: hidden;
    width: 100%;
    text-align: center;
    color: vars.$white;
    opacity: 0.7;
    &::before {
      font-size: vars.$font_large;
      margin: 10px;
    }
  }

  form {
    text-align: center;

    div.form-item {
      font-size: vars.$font_small;
      display: grid;
      grid-template-columns: 0.5fr 1fr;
      align-items: center;

      input[type="checkbox"] {
        height: 60%;
        width: 100%;
      }

      label,input {
        margin-top: 10px;
      }
      input {
        padding: 5px 2px 5px 2px;
        font-size: inherit;
        font-family: inherit;
        @include vars.input-style;

        &[name="verify"] {
            border-bottom: 2px solid;
            border-color: transparent;
        }
        &[name="generate"].safari {
          // Checkbox is not automatically centered in Safari
          display: inline-block;
          margin-left: 40%;
          vertical-align: center;
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

      @include vars.desktop-hover {
        border-color: vars.$pink;
      }
    }
  }
</style>
