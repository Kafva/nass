<script lang="ts">
import type {PassEntry} from '../types'

export let name: string;
export let subitems: Array<PassEntry>;
</script>

<li>
{#if subitems.length == 0}
{name}

{:else}

<ul>
{#each subitems as child}
  <!-- Create a new entry recursively for each child -->
  <svelte:self name={child.name} subitems={child.subitems}/>
{/each}
</ul>

{/if}
</li>



