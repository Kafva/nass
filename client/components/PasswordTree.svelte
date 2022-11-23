<script lang="ts">
  import { authInfoStore, foldPolicyStore, msgTextStore, queryStringStore,
    rootEntryStore, showPassStore, visibleButtonsStore }
    from '../ts/store'
  import { Config, MessageText} from '../ts/config'
  import { FoldPolicy } from '../ts/types'
  import type { ApiResponse, AuthInfo, PassItem } from '../ts/types'
  import { CopyToClipboard, Debug, IsMobile } from '../ts/util'
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
  // Increase the left-justification as we go to deeper levels
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

  const handleDelPass = () => {
    if (confirm(`Are you sure you want to delete '${path}'?`)) {
      api.delPass(path).then((apiRes: ApiResponse) => {
        if (apiRes.status == ApiStatusResponse.success) {
          const newTree = $rootEntryStore.updateTree(path, true)
          rootEntryStore.set(newTree)
          msgTextStore.set([MessageText.deleted, path])
        } // Errors are handled internally by `api`
      })
    }
  }

  const handleGetPass = (useClipboard: boolean) => {
    api.getPass(path, "").then((apiRes: ApiResponse) => {
      switch (apiRes.status) {
      case ApiStatusResponse.success:
        Debug("Already authenticated", apiRes)
        if (useClipboard) {
          CopyToClipboard(apiRes.value)
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
    })
  }

  const handleMainClick = () => {
    if (!isLeaf) {
      foldPolicyStore.set(FoldPolicy.localControl)
      open = !open
    }
    if (IsMobile()) {
      visibleButtonsStore.set(path)
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
            style:margin-left={marginLeft}>
        {entry.name}
      </span>

      {#if showButtons || !IsMobile()}
        <div class="buttons">
          {#if isLeaf}
            <span role="button" class="nf {Config.clipboardIcon}"
                  on:click="{() => handleGetPass(true) }"/>
            <span role="button" class="nf {Config.showPassword}"
                  on:click="{() => handleGetPass(false) }"/>
          {/if}
          <span role="button" class="nf {Config.deleteIcon}"
                on:click="{handleDelPass}" />
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
    display: grid;
    grid-template-columns: 0.65fr 0.35fr;
    text-align: center;
    font-size: vars.$font_medium;
    white-space: nowrap;
    padding: 4px 0 4px 0;
    margin: 2px 0 5px 0;
    @include vars.mobile {
      border-radius: 5%;
      // Increase height on mobile to avoid cluttered UI
      height: 10vh;
    }

    & > span {
      // Vertical centering
      display: inline-flex;

      // Text overflow
      //display: inline-block;
      text-overflow: ellipsis;
      overflow: hidden;
      overflow-wrap: break-word;
      hyphens: auto;
      width: 50%;

      align-items: center;
      &::before {
        // Spacing between text and icon
        margin: 20px;
      }
    }

    // Always show the border (translucently)
    // to avoid geometry changes on :hover()
    border-bottom: solid 1px;
    border-color: rgba(0,0,0,0.0);

    div.buttons {
      // Horizontal alignment
      display: inline-flex;
      justify-content: space-evenly;

      // Hide buttons icons without changing geometry
      color: vars.$white;
      @include vars.desktop {
        opacity: 0;
      }

      span {
        // Vertical centering
        display: inline-flex;
        align-items: center;

        // == Mobile ==
        @include vars.mobile {
          @include vars.fade-in(0.5s);
          font-size: vars.$font_icon_high_mobile;
          height: 100%;
          width: 100%;
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
