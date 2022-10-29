<script lang="ts">
import type { ApiResponse } from '../ts/types';
import { ApiStatusResponse } from '../ts/types';

import Config from '../ts/config';

import type PassEntry from '../ts/PassEntry'
export let entry: PassEntry;

import {msgText, queryString} from '../ts/store'
let currentQuery = ""

queryString.subscribe( (value: string) => {
  currentQuery = value.toLowerCase();
})

const fetchPassword = async (path: string) => {
  try {
    const res = await fetch(`/get?path=`)
    //const res = await fetch(`/get?path=${path}`)
    try {
      const apiRes = (await res.json()) as ApiResponse

      switch (apiRes.status) {
        case ApiStatusResponse.error:
          msgText.set(["Error",`${res.status}: '${apiRes.desc}'`])
          break;
        case ApiStatusResponse.retry:
          // TODO display auth dialog
          break;
        case ApiStatusResponse.success:
          // TODO display password
          break;
      }
    } catch (err) {
      msgText.set(["Error", "parsing response"])
      console.error(err)
    }
  } catch (err) {
    msgText.set(["Error",`fetching '${path}'`])
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
  <div class:pw="{isLeaf && !isRoot}">

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
    </div>
  {/if}

  {#if (!isLeaf && open) || isRoot }
    {#each entry.subitems as subitem}
      <!-- Create a new entry recursively for each child -->
      <svelte:self entry={subitem}/>
    {/each}
  {/if}
  </div>
{/if}



<style lang="scss">
@use "../scss/vars";

%shared {
  font-size: vars.$font_medium;
  padding: 4px 0 4px 0;
  margin: 2px 0 5px 0;

  // Always show the border (translucently)
  // to avoid geometry changes on :hover()
  border-bottom: solid 1px;
  border-color: rgba(0,0,0,0.0);


  &:hover {
    border-color: vars.$lilac;
  }
}

div {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  @include vars.fade-in(0.5s);

  &.dir {
    @extend %shared;
    span {
      display: inline;
      width: fit-content;

      &.name {
        width: 50vw;
      }
    }
  }

  &.pw {
    @extend %shared;
    span.nf {
      margin-right: 7px;
    }
  }
}
</style>
