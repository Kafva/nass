<script lang="ts">
  import { authInfoStore, showPassStore, treeUpdateStore } from '../ts/store'
  import { GetHTMLElement } from '../ts/util'
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
  let rootEntry = new PassEntry("", [], [], [])

  // Load the full tree and compile a list of subpaths for each
  // node (used for matching each node against a query string)
  rootEntry.loadFromDOM(tmpl, [])
  rootEntry.updateSubpaths()

  treeUpdateStore.subscribe( (u: TreeUpdate) => { 
    if (u.path != "") { 
      rootEntry = rootEntry.updateTree(u) 
    }
  })

  // TESTING
  // setTimeout( () => {
  //   rootEntry.updateTree({path: "Github/Jane0x3",   remove: false})
  //   rootEntry.updateTree({path: "Wallets/eth/main", remove: true})
  //   rootEntry.updateTree({path: "Wallets/eth/xD",   remove: false})
  //   rootEntry.updateTree({path: "Wallets/eth/xd",   remove: false})
  //   rootEntry.updateTree({path: "mastercard",       remove: true}) // TODO
  //   console.log(rootEntry)
  // }, 2000)

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
