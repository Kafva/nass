<script lang="ts">
import type {PassEntry} from '../ts/types'

export let entry: PassEntry;



</script>

<div class="{entry.subitems.length > 0 ? 'dir' : '' }">
{#if entry.name.length != 0}
<span>{entry.name}</span>
{/if}

{#if entry.subitems.length != 0}
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