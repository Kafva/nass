<script lang="ts">
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

@font-face {
  font-family: "Meslo";
  src: url("meslo-nerd-fonts.ttf");
}

:root {
  --bg: #232845;
  --white: #f5e4f3;
}

html, body {
  font-family: Meslo, Arial;
  height: 100%;
  background-color: var(--bg);
  color: var(--white);
  text-align: center;
}

#root {
  display: inline-block;
}
</style>
