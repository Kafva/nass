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
  import type {PassEntry} from '../ts/types'
  import {GetHTMLElement, PassEntryFromDOM} from '../ts/util'
  import PasswordTree from './PasswordTree.svelte'


  const entry = { name: "root", subitems:[] } as PassEntry
  const tmpl = GetHTMLElement<HTMLDivElement>("#tmpl")
  const rootEntry = PassEntryFromDOM(tmpl, entry)

</script>

<main>
  <h1>nass</h1>
  <PasswordTree entry={rootEntry} />
</main>

<style>



</style>
