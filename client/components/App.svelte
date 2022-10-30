<script lang="ts">
import {GetHTMLElement } from '../ts/util'
import { authDialogForPath, msgText } from '../ts/store';
import { MessageText } from '../ts/types';
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
// node (used for matching each node against a query string)
rootEntry.loadFromDOM(tmpl, [])
rootEntry.updateSubpaths()

let needAuthForPath = ""
authDialogForPath.subscribe((value: string) => needAuthForPath = value)


if (!Object.keys(navigator).includes('clipboard')) {
  // Wait a short time before printing the error to ensure
  // that the <Msg/> is loaded
  setTimeout(()=>{
    msgText.set([MessageText.err, "Clipboard is inaccessible"])
    console.error(
      "Clipboard is inaccessible, the site origin needs to be over https:// or localhost"
    )
  }, 2000)
}

</script>

<Msg/>

<Search/>

<Dialog component={Help}    btnClass="nf-mdi-help"/>
<Dialog component={AddPass} btnClass="nf-fa-plus"/>
{#if needAuthForPath != ""}
  <Dialog component={Auth}  btnClass="" path={needAuthForPath}/>
{/if}

<PasswordTree entry={rootEntry}/>

<style lang="scss">
@import "../scss/global";
</style>
