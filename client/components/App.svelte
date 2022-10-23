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
  import {queryString} from '../ts/store'
  import PassEntry from '../ts/PassEntry'

  import Search from './Search.svelte'
  import PasswordTree from './PasswordTree.svelte'

  const tmpl = GetHTMLElement<HTMLDivElement>("#tmpl")
  const rootEntry = new PassEntry("", [])

  rootEntry.loadFromDOM(tmpl)

  let prunedTree = new PassEntry("", [])

  queryString.subscribe((value:string) =>
    prunedTree = rootEntry.pruneToQuery(value)
  )

</script>

<Search/>
<PasswordTree entry={prunedTree}/>

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
