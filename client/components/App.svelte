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

  import {GetHTMLElement} from '../ts/util'
  import PassEntry from '../ts/PassEntry'

  import Search from './Search.svelte'
  import PasswordTree from './PasswordTree.svelte'

  const tmpl = GetHTMLElement<HTMLDivElement>("#tmpl")
  const rootEntry = new PassEntry("", [], [], [])

  // Load the full tree and compile a list of subpaths for each
  // node (used for matching each node agianst a query string)
  rootEntry.loadFromDOM(tmpl, [])
  rootEntry.updateSubpaths()
</script>

<Search/>
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
