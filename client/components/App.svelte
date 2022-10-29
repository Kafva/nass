<script lang="ts">
  import {GetHTMLElement } from '../ts/util'
  import PassEntry from '../ts/PassEntry'
  import Search from './Search.svelte'
  import PasswordTree from './PasswordTree.svelte'
  import Dialog from './Dialog.svelte';
  import AddPass from './AddPass.svelte';
  import Help from './Help.svelte';
  import Auth from './Auth.svelte';
  import Msg from './Msg.svelte';

  const tmpl = GetHTMLElement<HTMLDivElement>("#tmpl")
  const rootEntry = new PassEntry("", [], [], [])

  // Load the full tree and compile a list of subpaths for each
  // node (used for matching each node agianst a query string)
  rootEntry.loadFromDOM(tmpl, [])
  rootEntry.updateSubpaths()
</script>

<Msg/>

<Search/>

<Dialog component={Help}    btnClass="nf-mdi-help"/>
<Dialog component={AddPass} btnClass="nf-fa-plus"/>
<Dialog component={Auth}    btnClass=""/>

<PasswordTree entry={rootEntry}/>

<style lang="scss">
@import "../scss/global";
</style>
