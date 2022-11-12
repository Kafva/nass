<script lang="ts">
  import { authInfoStore, foldPolicyStore, rootEntryStore, showPassStore } from '../ts/store'
  import { Debug, GetHTMLElement } from '../ts/util'
  import PassEntry from '../ts/PassEntry'
  import Search from './Search.svelte'
  import PasswordTree from './PasswordTree.svelte'
  import Dialog from './Dialog.svelte'
  import AddPass from './AddPass.svelte'
  import Help from './Help.svelte'
  import Auth from './Auth.svelte'
  import Msg from './Msg.svelte'
  import ShowPass from './ShowPass.svelte'
    import { FoldPolicy } from '../ts/types';

  const tmpl = GetHTMLElement<HTMLDivElement>("#tmpl")
  let rootEntry = new PassEntry("", [], [], [])

  // Load the full tree and compile a list of subpaths for each
  // node (used for matching each node against a query string)
  rootEntry.loadFromDOM(tmpl, [])
  rootEntry.updateSubpaths()

  rootEntryStore.set(rootEntry)

  rootEntryStore.subscribe((newRoot: PassEntry) => {
    rootEntry = newRoot
    Debug("Updated tree", rootEntry)
  })

  // import { MessageText } from '../ts/config';
  // setTimeout(()=>msgTextStore.set([MessageText.pathOverlap, ""]), 1000)
</script>

<Msg/>
<Search/>

 

<Dialog component={Help}    btnClass="nf-mdi-help"/>
<Dialog component={AddPass} btnClass="nf-fa-plus"/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span role="button" 
      class="nf {$foldPolicyStore == FoldPolicy.allOpen ? 'nf-oct-fold' : 
                                                          'nf-oct-unfold'}"
      on:click="{() =>
          foldPolicyStore.set($foldPolicyStore == FoldPolicy.allOpen ? 
                              FoldPolicy.allClosed : FoldPolicy.allOpen)
      }"
/>

{#if $authInfoStore.path != ""}
  <Dialog component={Auth}     btnClass=""/>
{:else if $showPassStore.path != ""}
  <Dialog component={ShowPass} btnClass=""/>
{/if}

<!-- With #key the password tree will be re-created from scratch when changes
occur, this simplifies the update logic. -->
{#key rootEntry}
  <PasswordTree entry={rootEntry}/>
{/key}

<style lang="scss">
  @use "../scss/vars";
  @import "../scss/global";

  span.nf {
    @include vars.button-style;
  }
</style>
