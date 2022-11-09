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

  // Increase the left-justification as we go to deeper levels
  const marginLeft = `${(entry.parents.length+1) * 50}px`
  const isRoot = entry.name == ""
  const isLeaf = entry.subitems.length == 0
  let open = false

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
      class:dir="{!isLeaf}"
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
      <span role="button"
        class="{ isLeaf ? Config.passwordIcon : (open ? Config.dropdownOpen : Config.dropdownClosed)}"
        style:margin-left={marginLeft}
        on:click="{() => runIfNotMobile(handleMainClick) }"
      />
      <span role="button" class="name" on:click="{() => runIfNotMobile(handleMainClick) }">
        {entry.name}
      </span>

      {#if isLeaf}
        <span role="button" class="{Config.showPassword} show-pass"
              bind:this={showButton} on:click="{() => runIfNotMobile(handleGetPass, false) }"/>
      {/if}
      <span role="button" class="{Config.deleteIcon} delete-pass"
            bind:this={deleteButton} on:click="{() => runIfNotMobile(handleDelPass)}" />
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

  div {
    @include vars.fade-in(0.5s);
    font-size: vars.$font_medium;
    white-space: nowrap;
    padding: 4px 0 4px 0;
    margin: 2px 0 5px 0;

    // Always show the border (translucently)
    // to avoid geometry changes on :hover()
    border-bottom: solid 1px;
    border-color: rgba(0,0,0,0.0);

    &.dir {
      span {
        display: inline;
        width: fit-content;

        &.name {
          width: 50vw;
        }
      }
    }

    span.name {
      text-overflow: ellipsis;
      overflow: hidden;
    }

    span.nf {
      text-overflow: clip;
      overflow: hidden;
      margin: 0 7px 0 7px;

      // Hide all except the directory/key icon on the lhs
      // by default.
      &:not(:first-child) {
        display: none;
        @include vars.desktop-hover {
          color: vars.$lilac;
        }
      }


      // == Mobile ==
      @include vars.mobile {
        &.show-pass, &.delete-pass {
          width: 20px;
          padding: 2px 10px 2px 10px;
          margin: 0;
        }
        &.show-pass {
          background-color: vars.$green;
        }
        &.delete-pass {
          background-color: vars.$red;
        }
      }
    }

    @include vars.desktop-hover {
      border-color: vars.$lilac;

      // Display buttons on the direct child
      // when the parent element is hovered
      & > span.nf:not(:first-child) {
        display: inline-block;
      }
    }
  }
</style>
