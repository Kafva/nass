<script lang="ts">
  import Config from '../ts/config';
  import type { ApiResponse } from '../ts/types';
  import type PassEntry from '../ts/PassEntry'
  import { ApiStatusResponse, MessageText } from '../ts/types';
  import { msgText, queryString, authDialogForPath } from '../ts/store'

  export let entry: PassEntry;
  let currentQuery = ""

  queryString.subscribe( (value: string) => {
    currentQuery = value.toLowerCase();
  })

  const fetchPassword = async (path: string) => {
    try {
      // const res = await fetch(`/get?path=`)
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
          // TODO display password
          //   1. Copy to clipbard and create notification
          //   2. Have seperate button for show (this should give a dialog popup similar to Help)
          console.log("Already authenticated", apiRes)
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

  // Increase the left-justifaction as we go to deeper levels
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
          fetchPassword(entry.path())
        } else {
          open = !open
        }
      }}"
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
        <span role="button" class="{Config.showPassword}"/>
      {/if}
      <span role="button" class="{Config.deleteIcon}"/>

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

    &:not(.dir) {
      // Display buttons when the parent element is hovered
      &:hover {
        span.nf:not(:first-child) {
          display: inline-block;
        }
      }

    }
  }
</style>
