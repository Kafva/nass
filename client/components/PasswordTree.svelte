<script lang="ts">
  import { authInfoStore, foldPolicyStore, msgTextStore, queryStringStore, rootEntryStore, showPassStore, visibleButtonsStore } from '../ts/store'
  import { Config, MessageText} from '../ts/config'
  import { FoldPolicy } from '../ts/types'
  import type { ApiResponse, AuthInfo, PassItem } from '../ts/types'
  import { CopyToClipboard, Debug } from '../ts/util'
  import { ApiStatusResponse } from '../ts/types'
  import type PassEntry from '../ts/PassEntry'
  import ApiRequest from '../ts/ApiRequest'
  import TouchHandler from '../ts/TouchHandler'

  export let entry: PassEntry
  const path = entry.path()
  let currentQuery = ""
  let deleteButton: HTMLSpanElement
  let showButton: HTMLSpanElement|null = null
  const api = new ApiRequest()
  const touch = new TouchHandler(path)

  const isRoot = entry.name == ""
  const isLeaf = entry.subitems.length == 0
  let open = false

  // Use a grid layout for each row
  // -----------------------------------------------
  // | <span icon/> | <span name/> | <div drawer/> |
  // -----------------------------------------------
  // Instead of adjusting the left margin of the icon span we will
  // adjust the `grid-template-columns` layout for each tree level and
  // touches on the drawer.
  //
  // Increase the space occupied by the icon column as 
  // we go deeper.
  // --------------------------------------------------------------------------- 
  // |  [ICON_MIN,ICON_MAX] |  2/3 of remaining space | 1/3 of remaining space |
  // --------------------------------------------------------------------------- 
  const ICON_MIN_SPACE = 0.1
  const ICON_MAX_SPACE = 0.6

  const treeLevel = ((entry.parents.length+1) / Config.maxPassDepth)
  const iconColumn = Math.max(ICON_MIN_SPACE, treeLevel * ICON_MAX_SPACE)
  const nameColumn = 2 * ((1 - iconColumn) / 3)
  const drawerColumn = 1 * ((1 - iconColumn) / 3)
  const gridTemplateColumns = `${iconColumn}fr ${nameColumn}fr ${drawerColumn}fr`

  queryStringStore.subscribe((value: string) => {
    currentQuery = value.toLowerCase()
  })

  // Hide local buttons if another path has visible buttons
  visibleButtonsStore.subscribe((value: string) => {
    if (value != path) {
      touch.hideButton(deleteButton)
      touch.hideButton(showButton)
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
      default:
        // Errors are handled internally by `api`
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
    if (!touch.isMobile()) f(args)
  }
</script>

{#if entry.matchesQuery(currentQuery)}
  <!-- The root entry has an empty name -->
  {#if !isRoot }
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="row"
      style:grid-template-columns={gridTemplateColumns}
      on:touchstart="{(e) => touch.start(e, deleteButton, showButton) }"
      on:touchmove="{(e) => touch.move(e, deleteButton, showButton) }"
      on:touchend="{(e) => {
        const btn = touch.end(e, deleteButton, showButton)
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
      <span role="button"
        class="{ isLeaf ? Config.passwordIcon : 
          (open ? Config.dropdownOpen : Config.dropdownClosed)} row-icon"
        on:click="{() => runIfNotMobile(handleMainClick) }"
      />
      <span role="button" class="name" on:click="{() => runIfNotMobile(handleMainClick) }">
        {entry.name}
      </span>

      <div class="drawer">
        {#if isLeaf}
          <span role="button" class="{Config.showPassword} show-pass"
                bind:this={showButton} on:click="{() => runIfNotMobile(handleGetPass, false) }"/>
        {/if}
        <span role="button" class="{Config.deleteIcon} delete-pass"
              bind:this={deleteButton} on:click="{() => runIfNotMobile(handleDelPass)}" />
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
    text-align: center;
    font-size: vars.$font_medium;
    white-space: nowrap;
    padding: 4px 0 4px 0;
    margin: 2px 0 5px 0;

    // Always show the border (translucently)
    // to avoid geometry changes on :hover()
    border-bottom: solid 1px;
    border-color: rgba(0,0,0,0.0);

    @include vars.desktop-hover {
      border-color: vars.$lilac;
      // Display buttons on the direct child
      // when the parent element is hovered
      div.drawer > span.nf {
        display: inline-block;
      }
    }

    // Hide drawer icons
    span.nf:not(.row-icon) {
      display: none;
      @include vars.desktop-hover {
        color: vars.$lilac;
      }
    }
  }
</style>
