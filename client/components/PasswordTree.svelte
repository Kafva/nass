<script lang="ts">
  import Config from '../ts/config';
  // import { IS_MOBILE } from '../ts/util';
  import type { ApiResponse } from '../ts/types';
  import type PassEntry from '../ts/PassEntry'
  import { ApiStatusResponse, MessageText } from '../ts/types';
  import { msgText, queryString, authDialogForPath } from '../ts/store'
  import { CopyToClipboard } from '../ts/util';

  const SWIPE_MARGIN = 40
  export let entry: PassEntry;
  let currentQuery = ""
  let deleteButton: HTMLSpanElement;
  let showButton: HTMLSpanElement|null = null;

  queryString.subscribe( (value: string) => {
    currentQuery = value.toLowerCase();
  })

  const fetchPassword = async (path: string, echoToClipboard: boolean) => {
    try {
      const res = await fetch(`/get?path=${path.slice(1)}`)
      try {
        const apiRes = (await res.json()) as ApiResponse

        switch (apiRes.status) {
        case ApiStatusResponse.error:
          msgText.set([MessageText.err, `${res.status}: '${apiRes.desc}'`])
          break;
        case ApiStatusResponse.retry:
          authDialogForPath.set(path)
          break;
        case ApiStatusResponse.success:
          console.log("Already authenticated", apiRes)
          if (echoToClipboard) {
            CopyToClipboard(apiRes.value) 
          } else {
            // This requires a new Dialog that holds ShowPass
          }
          break;
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
      on:click="{() => {
        if (isLeaf) {
          fetchPassword(entry.path(), true)
        } else {
          open = !open
        }
      }}"
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
        <span bind:this={showButton} role="button" class="{Config.showPassword}"/>
      {/if}
      <span bind:this={deleteButton} role="button" class="{Config.deleteIcon}"/>

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
