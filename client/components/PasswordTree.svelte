<script lang="ts">
  import { authInfoStore, foldPolicyStore, msgTextStore, queryStringStore, 
    rootEntryStore, showPassStore, visibleButtonsStore } 
    from '../ts/store'
  import { Config, MessageText} from '../ts/config'
  import { FoldPolicy } from '../ts/types'
  import type { ApiResponse, AuthInfo, PassItem } from '../ts/types'
  import { CopyToClipboard, Debug } from '../ts/util'
  import { ApiStatusResponse } from '../ts/types'
  import type PassEntry from '../ts/PassEntry'
  import ApiRequest from '../ts/ApiRequest'
  import TouchHandler from '../ts/TouchHandler'

  export let entry: PassEntry
  let currentQuery = ""

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
  const touch = new TouchHandler(path)

  queryStringStore.subscribe((value: string) => {
    currentQuery = value.toLowerCase()
  })

  // Restore the grid layout if another path has visible buttons
  visibleButtonsStore.subscribe((value: string) => {
    if (value != path) {
      touch.restoreLayout()
    }
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
      default: // Errors are handled internally by `api`
      }
    })
  }

  const handleMainClick = () => {
    if (isLeaf) {
      handleGetPass(true)
    } else {
      foldPolicyStore.set(FoldPolicy.localControl)
      open = !open
    }
  }

  const runIfNotMobile = (f: Function, ...args: any) => {
    if (!touch.isMobile()) f(...args)
  }
</script>

{#if entry.matchesQuery(currentQuery)}
  <!-- The root entry has an empty name -->
  {#if !isRoot }
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="row"
      bind:this={touch.grid}
      on:touchstart="{(e) => touch.start(e) }"
      on:touchmove="{(e) => touch.move(e) }"
      on:touchend="{(e) => {
        const btn = touch.end(e)
        if (btn != null) {
          if (btn.classList.contains('delete-pass')) {
            handleDelPass()
          } else if (btn.classList.contains('show-pass')) {
            handleGetPass(false)
          } else {
            handleMainClick()
          }
        }
      }}"
    >
      <!-- on:click() events are used on desktop and disabled in favor of
      ontouch* on mobile -->
      <span role="button" class="{ isLeaf ? Config.passwordIcon : 
          (open ? Config.dropdownOpen : Config.dropdownClosed) }" 
            on:click="{() => runIfNotMobile(handleMainClick) }"
            style:margin-left={marginLeft}>
        {entry.name}
      </span>

      <div class="buttons">
        {#if isLeaf}
          <span role="button" class="{Config.showPassword} show-pass"
                on:click="{() => runIfNotMobile(handleGetPass, false) }"/>
        {/if}
        <span role="button" class="{Config.deleteIcon} delete-pass"
              on:click="{() => runIfNotMobile(handleDelPass)}" />
      </div>
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
    grid-template-columns: 0.7fr 0.3fr;
    text-align: center;
    font-size: vars.$font_medium;
    white-space: nowrap;
    padding: 4px 0 4px 0;
    margin: 2px 0 5px 0;
    @include vars.mobile { 
      border-radius: 5%; 
      // Increase height on mobile to avoid cluttered UI
      height: 5vh;
    }

    span {
      // Vertical centering
      display: inline-flex;
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
      display: inline-flex;
      justify-content: space-evenly;

      // Hide buttons icons without changing geometry
      span.nf {
        color: vars.$white;
        opacity: 0;
      }
      // == Mobile ==
      @include vars.mobile {
        span {
          // The initial font size for buttons should not be to big
          // since we use a magnifier effect on touchmove().
          font-size: vars.$font_icon_low_mobile;
          height: 100%;
          width: 100%;
          // We want the padding to be fairly large so that touch events do not
          // need to be too exact.
        }
      }
    }

    // == Desktop hover ==
    @include vars.desktop {
      &:hover {
        // Display buttons on the direct child
        // when the parent element is hovered
        border-color: vars.$lilac;

        div.buttons > span.nf {
          opacity: 1.0;
        }
      }

      div.buttons > span.nf:hover {
        opacity: 1.0;
        color: vars.$lilac;
      }
    }
  }
</style>
