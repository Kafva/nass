<script lang="ts">
  import {GetHTMLElement } from '../ts/util'
  import PassEntry from '../ts/PassEntry'
  import Config from '../ts/config';

  import Search from './Search.svelte'
  import PasswordTree from './PasswordTree.svelte'
  import Dialog from './Dialog.svelte';
  import AddPass from './AddPass.svelte';
  import Help from './Help.svelte';
  import Auth from './Auth.svelte';

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

</script>

<svelte:window on:click={HandleClick}/>

<Search/>

<Dialog component={AddPass} cover={cover} btnClass="nf-fa-plus"/>
<Dialog component={Help}    cover={cover} btnClass="nf-mdi-help"/>
<Dialog component={Auth}    cover={cover} btnClass=""/>

<PasswordTree entry={rootEntry}/>

<style lang="scss">
@import "../scss/global";
</style>
