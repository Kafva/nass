<script lang="ts">
  // Search bar
  // Settings item
  //  Server location
  //  PSK
  //
  // Collapsable list-items
  //
  // Password dialog (popup based on server response)
  // After one entry, any item can be pressed to reveal text or copy to clipboard
  import type {PassEntry} from './types'
  import PasswordTree from './components/PasswordTree.svelte'


  let subitems = [ { 
  name: "xd", 
  subitems: [ { 
      name: "child1", 
      subitems: [] 
    } as PassEntry ] 
  } as PassEntry ]

</script>

<main>
  <h1>nass</h1>
  <PasswordTree name="xd" subitems={subitems} />
</main>

<style>



</style>
