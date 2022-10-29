<script lang="ts">
  import {GetHTMLElement } from '../ts/util'
  import PassEntry from '../ts/PassEntry'
  import Config from '../ts/config';
  import { MessageText } from '../ts/types';
  import { msgText } from '../ts/store';

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

  // The 'modalCover' is mounted outside of the svelte #root
  const cover = GetHTMLElement<HTMLDivElement>(`#${Config.modalCoverId}`)

  function HandleClick(event: MouseEvent) {
    // Hide any open dialog when the modalCover is clicked
    if ((event.target as HTMLElement).id == Config.modalCoverId) {
      cover.hidden = true;
      document.querySelectorAll('dialog').forEach( (dialog: HTMLDialogElement) => {
        dialog.close()
      })
    }
  }

  //setTimeout(()=>msgText.set(["xDDD",""]) , 2000)
  setTimeout(()=>msgText.set([MessageText.added.toString(),"new_password"]) , 1000)
  //setTimeout(()=>msgText.set([MessageText.deleted.toString(),"very/long/path/to_some/password"]) , 4000)
  //setTimeout(()=>msgText.set([MessageText.clipboard.toString(),""]) , 5000)

</script>

<svelte:window on:click={HandleClick}/>

<Msg/>
<Search/>

<Dialog component={Help}    cover={cover} btnClass="nf-mdi-help"/>
<Dialog component={AddPass} cover={cover} btnClass="nf-fa-plus"/>
<Dialog component={Auth}    cover={cover} btnClass=""/>

<PasswordTree entry={rootEntry}/>

<style lang="scss">
@import "../scss/global";
</style>
