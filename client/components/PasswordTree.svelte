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

</script>

{#if entry.matchesQuery(currentQuery)}
  <div class:pw="{entry.subitems.length == 0 && entry.name != ''}">

  <!-- The root entry has an empty name-->
  {#if entry.name.length != 0 }
    <div class:dir="{entry.subitems.length > 0 && entry.name != ''}">
      <span
        class="{entry.subitems.length != 0 ? Config.dropdownOpen : ''}"
        style:margin-left={margin_left}
      />
      <span class="name">{entry.name}</span>
    </div>
  {/if}

  {#if entry.subitems.length != 0 }
    {#each entry.subitems as subitem}
      <!-- Create a new entry recursively for each child -->
      <svelte:self entry={subitem}/>
    {/each}
  {/if}
  </div>
{/if}



<style lang="scss">
div {
  text-align: left;
  display: block;
  padding: 5px 0 5px 0;
  width: 50vw;

  &.dir {
    font-size: 22px;
    padding: 8px 0 8px 0;
    margin: 5px 0 10px 0;
    background-color: var(--folder);

    span {
      display: inline;
      width: fit-content;

      &.name {
        width: 50vw;
      }
    }
  }

  &.pw {
    background-color: var(--bg);
  }
}
</style>
