<script lang="ts">
  // Search bar
  // Settings item
  //  Server location
  //  PSK
  //
  // Collapsable list-items
  //
  // Password dialog (popup based on server response)
  // After one entry, any item can be pressed to reveal text or 
  // copy to clipboard
  import type {PassEntry} from '../ts/types'
  import {GetHTMLElement, PassEntryFromDOM} from '../ts/util'
  import PasswordTree from './PasswordTree.svelte'

  const tmpl = GetHTMLElement<HTMLDivElement>("#tmpl")
  const rootEntry = PassEntryFromDOM(tmpl, {name: "", subitems:[]} as PassEntry)
</script>

<PasswordTree entry={rootEntry}/>

<style lang="css" global>
:root {
  --bg: #23283d;
  --white: #f5e4f3;
}

html, body {
  font-family: Arial;
  height: 100%;
  background-image: linear-gradient(to right, var(--bg), #1f1f47);
  color: var(--white);
  text-align: center;
}

#root {
  display: inline-block;
}
</style>