<script lang="ts">
import type {PassEntry} from '../ts/types'

export let entry: PassEntry;

// If the query matches a folder, all subentries
// of that folder should be displayed
//
// If the query matches a file, the complete path
// to the file needs to be visible
//
// We cannot stop rendering once a node does not match the queryString
// since a deeper node could still match
//
// (Option 1): Always render all nodes as initially hidden and
// record if any item in a path was matched. Once a leaf has been reached, propogate
// a visibility change upwards.
//
// (Option 2): Prune the actual tree beforehand and send this to the rendering process
// export let queryString: string;

import {queryString} from '../ts/store'

let currentSearch = ""
queryString.subscribe( (value:string) => currentSearch = value )

</script>

<div class="{entry.subitems.length > 0 ? 'dir' : '' }">
{#if entry.name.length != 0 }
<span>{entry.name} {currentSearch}</span>
{/if}

{#if entry.subitems.length != 0 }
  {#each entry.subitems as subitem}
    <!-- Create a new entry recursively for each child -->
    <svelte:self entry={subitem}/>
  {/each}
{/if}
</div>


<style lang="scss">
div {
  display: block;
  padding: 5px 0 5px 0;
  width: 50vw;

  &.dir {
    padding-top: 20px;

    & > span {
      display: block;
      width: 50vw;

      border-bottom: solid 1px;
      border-bottom-color: var(--white);
    }
  }
}
</style>
