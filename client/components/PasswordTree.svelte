<script lang="ts">
import Config from '../ts/config';

import type PassEntry from '../ts/PassEntry'
export let entry: PassEntry;

import {queryString} from '../ts/store'
let currentQuery = ""

queryString.subscribe( (value: string) => {
  currentQuery = value.toLowerCase();
})

// Increase the left-justifaction as we go to deeper levels
let margin_left = `${(entry.parents.length+1) * 50}px`

let isRoot = entry.name == ""
let isLeaf = entry.subitems.length == 0
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
      on:click="{() => open = !open }"
    >
      {#if isLeaf}
        <span 
          class="nf nf-fa-lock"
          style:margin-left={margin_left}
        />
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

%shared {
  font-size: vars.$font_medium;
  padding: 4px 0 4px 0;
  margin: 2px 0 5px 0;

  &:hover {
    border-bottom: solid 1px;
    border-color: vars.$accent;
  }
}

div {
  @include vars.fade-in();
  text-align: left;
  display: block;
  width: 50vw;

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
  }
}
</style>
