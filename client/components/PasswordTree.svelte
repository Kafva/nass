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



</script>

{#if entry.matchesQuery(currentQuery)}
  <div class:dir="{entry.subitems.length > 0 && entry.name != ''}">

  <!-- The root entry has an empty name-->
  {#if entry.name.length != 0 }
    <span class="{entry.subitems.length != 0 ? Config.dropdownOpen : ''}"/>
    <span class="name">{entry.name}</span>
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
  display: block;
  padding: 5px 0 5px 0;
  width: 50vw;

  &.dir {
    padding: 20px 0 20px 0;
    margin: 20px 0 20px 0;
    border: solid 1px;
    border-color: var(--white);

    span {
      display: inline;
      width: fit-content;
      &.name {
        width: 50vw;
      }
      &.nf {
        font-size: 22px;
        margin-right: 10px;
      }
    }
  }
}
</style>
