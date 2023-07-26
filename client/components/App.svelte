<script lang="ts">
  import { authInfoStore, foldPolicyStore, rootEntryStore, showPassStore, visibleButtonsStore } from '../ts/store'
  import { Debug, GetHTMLElement, IsMobile, IsTinyMobile } from '../ts/util'
  import PassEntry from '../ts/PassEntry'
  import Search from './Search.svelte'
  import PasswordTree from './PasswordTree.svelte'
  import Dialog from './Dialog.svelte'
  import AddPass from './AddPass.svelte'
  import Help from './Help.svelte'
  import Auth from './Auth.svelte'
  import Msg from './Msg.svelte'
  import ShowPass from './ShowPass.svelte'
  import Loading from './Loading.svelte'
  import { FoldPolicy } from '../ts/types';
  import { Config } from '../ts/config';

  const centerFlyPercent = IsMobile() ? 70 : 150;
  const helpFlyPercent = IsTinyMobile() ? 10 : 20;
  const addPassFlyPercent = IsMobile() ? 30 : 60;

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

  //import { msgTextStore } from '../ts/store'
  //setTimeout(()=>msgTextStore.set([MessageText.clipboard, ""]), 1000)

  if (Config.debug) {
      Config.dump()
  }
</script>

<!-- Hide focused button (if any) when the body is clicked -->
<svelte:body on:click="{(event) => {
  // @ts-expect-error: EventTarget does not have an 'id' attribute
  if (IsMobile() && event.target.id == 'root') {
    visibleButtonsStore.set('')
  }
}}"/>

<Msg/>

<Loading/>

<!-- !! These define buttons AND a dialog !! -->
<Dialog component={Help}    btnClass="nf-mdi-help" title="About"
        percent={helpFlyPercent}/>
<Dialog component={AddPass} btnClass="nf-fa-plus"  title="Add password"
        percent={addPassFlyPercent}/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-interactive-supports-focus -->
<span role="button"
      class="nf {$foldPolicyStore == FoldPolicy.allOpen ? Config.foldIcon :
                                                          Config.unfoldIcon}"
      title="{$foldPolicyStore == FoldPolicy.allOpen ? 'Fold all' :
                                                       'Unfold all'}"
      on:click="{() =>
          foldPolicyStore.set($foldPolicyStore == FoldPolicy.allOpen ?
                              FoldPolicy.allClosed : FoldPolicy.allOpen)
      }"
/>

<Search/>

{#if $authInfoStore.path != ""}
  <Dialog component={Auth}     btnClass="" percent={centerFlyPercent}/>
{:else if $showPassStore.path != ""}
  <Dialog component={ShowPass} btnClass="" percent={centerFlyPercent}
          dialogClass="show-pass"/>
{/if}

<!-- With #key the password tree will be re-created from scratch when changes
occur, this simplifies the update logic. -->
{#key rootEntry}
  <PasswordTree entry={rootEntry}/>
{/key}

<style lang="scss">
@use "../scss/vars";
// Include the nerd-font symbols here rather than in the HTML
// to avoid a separate file from being created.
@import "../../fonts/nerd-fonts-nass.min.css";
@import "../scss/global";

span.nf {
    @include vars.button-style;
}
</style>
