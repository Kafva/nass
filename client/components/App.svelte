<script lang="ts">
  import { authInfoStore, showPassStore, treeUpdateStore } from '../ts/store'
  import { Debug, GetHTMLElement } from '../ts/util'
  import type { TreeUpdate } from '../ts/types'
  import PassEntry from '../ts/PassEntry'
  import Search from './Search.svelte'
  import PasswordTree from './PasswordTree.svelte'
  import Dialog from './Dialog.svelte'
  import AddPass from './AddPass.svelte'
  import Help from './Help.svelte'
  import Auth from './Auth.svelte'
  import Msg from './Msg.svelte'
  import ShowPass from './ShowPass.svelte'

  const tmpl = GetHTMLElement<HTMLDivElement>("#tmpl")
  const rootEntry = new PassEntry("", [], [], [])

  // Load the full tree and compile a list of subpaths for each
  // node (used for matching each node against a query string)
  rootEntry.loadFromDOM(tmpl, [])
  rootEntry.updateSubpaths()

  treeUpdateStore.subscribe( (treeUpdate: TreeUpdate) => {
    if (treeUpdate.delete) {
    } else {
    }
  })

  // TESTING
  setTimeout( () => {
    const path = "jane/Github/Jane0x2"
    rootEntry.deleteChild(path)
    Debug("Deleting!", path)
  }, 2000)

</script>

<Msg/>
<Search/>

<Dialog component={Help}    btnClass="nf-mdi-help"/>
<Dialog component={AddPass} btnClass="nf-fa-plus"/>

{#if $authInfoStore.path != ""}
  <Dialog component={Auth}     btnClass=""/>
{:else if $showPassStore.path != ""}
  <Dialog component={ShowPass} btnClass=""/>
{/if}

<PasswordTree entry={rootEntry}/>

<style lang="scss">
  @import "../scss/global"
</style>
