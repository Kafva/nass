<script lang="ts">
  import Config from '../ts/config';
  import ApiRequest from '../ts/ApiRequest';
  import type PassEntry from '../ts/PassEntry'
  import { queryStringStore, authInfoStore, showPassStore } from '../ts/store'
  import { CopyToClipboard, Debug } from '../ts/util';
  import type { ApiResponse, AuthInfo, PassItem } from '../ts/types';
  import { ApiStatusResponse } from '../ts/types';

  const SWIPE_MARGIN = 40
  export let entry: PassEntry;
  let currentQuery = ""
  let deleteButton: HTMLSpanElement;
  let showButton: HTMLSpanElement|null = null;
  const api = new ApiRequest()

  queryStringStore.subscribe( (value: string) => {
    currentQuery = value.toLowerCase();
  })

  const startTouch = (event: TouchEvent) => {
    const touch = event.touches.item(0)
    if (touch) {
      deleteButton.style.display     = "inline-block";
      deleteButton.style.opacity     = "0.0"

      if (showButton) {
        showButton.style.display     = "inline-block";
        showButton.style.marginLeft  = `${SWIPE_MARGIN}px`
        showButton.style.opacity     = "0.0"
      } else {
        deleteButton.style.marginLeft = `${SWIPE_MARGIN}px`
      }
    }
  }

  const swipe = (event: TouchEvent) => {
    const touch = event.touches.item(0)
    if (touch) {
      // 0.0: Far left
      // 1.0: Far right
      const x = touch.pageX/window.innerWidth

      // The margin starts from `SWIPE_MARGIN` on a new swipe
      // (far of to the right) and magnitude is decreased incrementally
      deleteButton.style.opacity     = `${1.0 - x}`

      if (showButton) {
        showButton.style.marginLeft  = `${SWIPE_MARGIN*x}px`
        showButton.style.opacity     = `${1.0 - x}`
      } else {
        deleteButton.style.marginLeft = `${SWIPE_MARGIN*x}px`
      }
    }
  }

  const endTouch = (event: TouchEvent) => {
    const touch = event.changedTouches.item(0)
    if (touch) {
      const x = touch.pageX/window.innerWidth
      if (x > 0.5) { // Hide the buttons if the swipe ends far to the right
        deleteButton.style.display     = "none"
        deleteButton.style.opacity     = "0.0"
        if (showButton) {
          showButton.style.display     = "none";
          showButton.style.opacity     = "0.0"
        }
      } else { // Let them remain visible if the swipe ends to the left
        deleteButton.style.display     = "inline-block";
        deleteButton.style.opacity     = "1.0"
        if (showButton) {
          showButton.style.display     = "inline-block";
          showButton.style.marginLeft  = "0px"
          showButton.style.opacity     = "1.0"
        } else {
          deleteButton.style.marginLeft = "0px"
        }
      }
    }
  }


  const handleDelPass = () => {
  }

  const handleGetPass = (useClipboard: boolean) => {
    if (isLeaf) {
      const path = entry.path()
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
    } else {
      open = !open
    }
  }

  // Increase the left-justification as we go to deeper levels
  const marginLeft = `${(entry.parents.length+1) * 50}px`
  const isRoot = entry.name == ""
  const isLeaf = entry.subitems.length == 0
  let open = false
</script>

{#if entry.matchesQuery(currentQuery)}
  <!-- The root entry has an empty name -->
  {#if !isRoot }
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class:dir="{!isLeaf}"
      role="button"
      on:click="{() => handleGetPass(true)}"
      on:touchstart="{startTouch}"
      on:touchmove="{swipe}"
      on:touchend="{endTouch}"
    >
      {#if isLeaf}
        <span
          class={Config.passwordIcon}
          style:margin-left={marginLeft}
        />
      {:else}
        <span
          class="{open ? Config.dropdownOpen : Config.dropdownClosed}"
          style:margin-left={marginLeft}
        />
      {/if}
      <span class="name">{entry.name}</span>

      {#if isLeaf}
        <span role="button" class="{Config.showPassword}"
              bind:this={showButton} on:click="{() => handleGetPass(false)}"/>
      {/if}
      <span role="button" class="{Config.deleteIcon}"
            bind:this={deleteButton} on:click="{() => handleDelPass()}" />

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
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    @include vars.fade-in(0.5s);

    font-size: vars.$font_medium;
    padding: 4px 0 4px 0;
    margin: 2px 0 5px 0;

    // Always show the border (translucently)
    // to avoid geometry changes on :hover()
    border-bottom: solid 1px;
    border-color: rgba(0,0,0,0.0);

    &:hover {
      border-color: vars.$lilac;

      // Display buttons on the direct child
      // when the parent element is hovered
      & > span.nf:not(:first-child) {
        display: inline-block;
      }
    }

    span.nf {
      margin: 0 7px 0 7px;

      &:not(:first-child) {
        display: none;

        &:hover {
          color: vars.$lilac;
        }
      }
    }

    &.dir {
      span {
        display: inline;
        width: fit-content;

        &.name {
          width: 50vw;
        }
      }
    }
  }
</style>
