<script lang="ts">
import type {PassEntry} from '../ts/types'
export let entry: PassEntry;
</script>

<div>
{#if entry.subitems.length == 0}
  {entry.name}
{:else}

{#each entry.subitems as subitem}
  <!-- Create a new entry recursively for each child -->
  <svelte:self entry={subitem}/>
{/each}

{/if}
</div>


<style>
div {
  text-align: left;
}
</style>
