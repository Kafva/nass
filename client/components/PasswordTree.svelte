<script lang="ts">
  import { authInfoStore, foldPolicyStore, msgTextStore, queryStringStore,
      rootEntryStore, showPassStore, visibleButtonsStore }
      from '../ts/store'
  import { Config, MessageText} from '../ts/config'
  import { FoldPolicy } from '../ts/types'
  import type { ApiResponse, AuthInfo, PassItem } from '../ts/types'
  import { Debug, IsLikelySafari, IsMobile, SupportsClipboardWrite } from '../ts/util'
  import { ApiStatusResponse } from '../ts/types'
  import type PassEntry from '../ts/PassEntry'
  import ApiRequest from '../ts/ApiRequest'

  export let entry: PassEntry
  let currentQuery = ""
  let showButtons = false

  const isRoot = entry.name == ""
  const isLeaf = entry.subitems.length == 0
  let open = false

  // Each row is in a grid:
  // --------------------------------
  // | <span name/> | <div buttons/> |
  // --------------------------------
  // Increase the left-justification as we go to deeper levels.
  // We decrease the width of the <span/> by the same proportion
  // to avoid overlap between the buttons and text.
  const marginLeft = `${(entry.parents.length) * 20}px`

  const path = entry.path()
  const api = new ApiRequest()

  queryStringStore.subscribe((value: string) => {
      currentQuery = value.toLowerCase()
  })

  // Restore the row layout if another path has visible buttons
  visibleButtonsStore.subscribe((value: string) => {
      showButtons = value == path
  })

  foldPolicyStore.subscribe((value: FoldPolicy) => {
      switch (value) {
      case FoldPolicy.allOpen:
          open = true
          break
      case FoldPolicy.allClosed:
          open = false
          break
      }
  })

  const handleMainClick = () => {
      if (!isLeaf) {
          foldPolicyStore.set(FoldPolicy.localControl)
          open = !open
      }
      if (IsMobile()) {
          visibleButtonsStore.set(path)
      }
  }

  const handleDelPass = () => {
      if (confirm(`Are you sure you want to delete '${path}'?`)) {
          api.delPass(path).then((apiRes: ApiResponse) => {
              if (apiRes.status == ApiStatusResponse.success) {
                  const newTree = $rootEntryStore.updateTree(path, true)
                  rootEntryStore.set(newTree)
                  msgTextStore.set([MessageText.deleted, path])
              } // Errors are handled internally by `api`
          })
              .catch(e => {
                  msgTextStore.set([MessageText.err, e])
              })
      }
  }

  const handleGetPassWithRetry = async (useClipboard: boolean,
      useSafariHack: boolean): Promise<string> => {
      return api.getPass(path, "").then((apiRes: ApiResponse) => {
          switch (apiRes.status) {
          case ApiStatusResponse.success:
              Debug("Already authenticated", apiRes)

              if (useClipboard) {
                  msgTextStore.set([MessageText.clipboard, ""])
                  if (useSafariHack) {
                      return Promise.resolve(apiRes.value)
                  } else {
                      navigator.clipboard.writeText(apiRes.value) // !! No await
                  }
              } else {
                  showPassStore.set({
                      path: path,
                      password: apiRes.value
                  } as PassItem)
              }
              break;
          case ApiStatusResponse.retry:
              // The authentication dialog is open as long
              // as a non-empty path is set togheter with an empty value
              authInfoStore.set({
                  path: path,
                  useClipboard: useClipboard
              } as AuthInfo)
              break;
          default: // Errors and auth failures are handled internally by `api`
          }
          return Promise.resolve("")
      })
          .catch(e => {
              msgTextStore.set([MessageText.err, e])
              return Promise.resolve("")
          })
  }


  /** Handler for clipboard button */
  const handleClipboard = () => {
      if (SupportsClipboardWrite()) {
      // WebKit (Safari and iOS) does not support `clipboard.write*()` outside
      // of user interaction handlers, i.e. onclick etc.
      // so we need a wrapper around the `api.getPass()` call for clipboard
      // management. The clipboard.write() API expects an
      // array of ClipboardItem objects as input. Each item is a key-mapping from
      // a MIME-type to a Promise that resolves to a Blob() or string.
      //
      // https://webkit.org/blog/10855/async-clipboard-api/
          const useSafariHack = IsLikelySafari() || IsMobile()
          const result = handleGetPassWithRetry(true, useSafariHack)

          if (useSafariHack) {
              /* eslint-disable no-undef */
              const textItem = new ClipboardItem({
                  "text/plain": result
              })
              navigator.clipboard.write([textItem])
                  .catch(e => {
                      msgTextStore.set([MessageText.err, (e as Error).message])
                  })
          }
      }
  }

</script>

{#if entry.matchesQuery(currentQuery)}
  <!-- The root entry has an empty name -->
  {#if !isRoot }
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="row"
         style:background-color="{ showButtons ? 'rgba(25, 25, 24, 0.2)' : 'transparent' }">
      <span role="button" class="nf { isLeaf ? Config.passwordIcon :
          (open ? Config.dropdownOpen : Config.dropdownClosed) }"
            on:click="{handleMainClick}"
            style:margin-left={marginLeft}
            style:width="{`calc(100% - ${marginLeft}px - 15px)`}"
            title="{entry.name}">
        {entry.name}
      </span>

      {#if showButtons || !IsMobile()}
        <div class="buttons">
          {#if isLeaf}
            <span role="button" class="nf {Config.clipboardIcon}"
                  on:click="{handleClipboard}"
                  title="Copy to clipboard"/>
            <span role="button" class="nf {Config.showPassword}"
                  on:click="{() => handleGetPassWithRetry(false, false) }"
                  title="Show password"/>
          {/if}
          <span role="button" class="nf {Config.deleteIcon}"
                on:click="{handleDelPass}"
                title="Delete entry"/>
        </div>
      {/if}
    </div>
  {/if}

  {#if (!isLeaf && open) || isRoot }
    {#each entry.subitems as subitem}
      <!-- Create a new entry recursively for each child -->
      <svelte:self entry={subitem}/>
    {/each}
  {/if}
{/if}

<style lang="scss">
  @use "../scss/vars";

  div.row {
    @include vars.fade-in(0.5s);
    display: flex;
    align-items: center;

    text-align: left;
    font-size: vars.$font_medium;
    white-space: nowrap;

    // Dimensions
    padding: 4px 0 15px 0;
    margin: 2px 0 15px 0;

    // Always show the border (translucently)
    // to avoid geometry changes on :hover()
    border-bottom: solid 1px;
    border-color: rgba(0,0,0,0.0);

    @include vars.mobile {
      border-radius: 5%;
      // Increase height on mobile to avoid cluttered UI
      // and horizontal padding.
      padding: 30px 15px 25px;
    }

    // == LHS ==
    & > span {
      // Text overflow requires inline-block
      display: inline-block;
      text-overflow: ellipsis;
      overflow: hidden;
      overflow-wrap: anywhere;
      hyphens: auto;
      // Ensure that the LHS always takes up 70% of the row,
      // this indirectly aligns the RHS.
      width: 70%;

      &::before {
        // Spacing between text and icon
        margin-right: 20px;
      }
    }

    // == RHS ==
    div.buttons {
      // Horizontal alignment
      display: inline-block;

      // Hide buttons icons without changing geometry
      color: vars.$white;
      @include vars.desktop {
        opacity: 0;
      }

      span {
        display: inline-block;
        // Spacing between buttons
        margin: 0 10px 0 10px;

        // == Mobile ==
        @include vars.mobile {
          font-size: vars.$font_icon_high_mobile;
          margin-left: 20px;
        }
      }
    }

    // == Desktop hover ==
    @include vars.desktop {
      &:hover {
        // Display buttons on the direct child
        // when the parent element is hovered
        border-color: vars.$lilac;

        div.buttons {
          opacity: 1.0;
        }
      }

      div.buttons > span.nf:hover {
        color: vars.$lilac;
      }
    }
  }
</style>
