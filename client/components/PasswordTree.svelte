<script lang="ts">
import Config from '../ts/config';

import type PassEntry from '../ts/PassEntry'
export let entry: PassEntry;

import {queryString} from '../ts/store'
let currentQuery = ""

queryString.subscribe( (value: string) => {
  currentQuery = value.toLowerCase();
})

// Each directory entry needs to have collapsed indicator
// Each file needs a view/clipboard button

// Increase the left-justifaction as we go to deeper levels
let margin_left = `${(entry.parents.length+1) * 50}px`

let isRoot = entry.name == ""
let isLeaf = entry.subitems.length == 0
let open = false

</script>

{#if entry.matchesQuery(currentQuery)}
  <div class:pw="{isLeaf && !isRoot}">

  <!-- The root entry has an empty name-->
  {#if !isRoot }
    <div 
      class:dir="{!isLeaf}"
      role="button"
      on:click="{() => open = !open }"
      on:keydown="{()=>null}"
    >
      <!-- Linter mad... -->
      {#if isLeaf}
        <span style:margin-left={margin_left}/>
      {:else}
        <span
          class="{open ? Config.dropdownOpen : Config.dropdownClosed}"
          style:margin-left={margin_left}
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

div {
  text-align: left;
  display: block;
  width: 50vw;

  &[role="button"] {
    cursor: pointer;
  }

  &.dir {
    font-size: 22px;
    padding: 8px 0 8px 0;
    margin: 5px 0 10px 0;
    background-color: vars.$folder;
    span {
      display: inline;
      width: fit-content;

      &.name {
        width: 50vw;
      }
    }
  }

  &.pw {
    font-size: 18px;
    padding: 4px 0 4px 0;
    margin: 2px 0 5px 0;
    background-color: vars.$bg;
  }
}
</style>
