<script lang="ts">
import Config from "../ts/config";
import { msgText } from "../ts/store";
import { MessageIcons } from "../ts/types";
import { fly } from "../ts/util";

let message = ""
let iconClass = ""
let timeoutID: any = null

msgText.subscribe( (value:[string,string]) => {
  message = value[0] + value[1];
  iconClass = MessageIcons[value[0]] || ""

  // Cancel the current timeout if one is already in progress
  if (timeoutID != null) {
    clearTimeout(timeoutID)
  }

  timeoutID = setTimeout(() => { 
    msgText.set(["",""])
    timeoutID = null
  }, Config.messageTimeout)

})
</script>

{#if message.length != 0}
  <div transition:fly="{{ vh: 2, duration: 200 }}">
    <p>{message} <span class="{'nf '+ iconClass}"/></p>
  </div>
{/if}


<style lang="scss">
@use "../scss/vars";

div {
  position: fixed;
  border-radius: 2%;
  color: vars.$white;
  z-index: vars.$msg_z;
  background-color: vars.$dialog_bg;
  border: 2px dotted vars.$lilac;

  p {
    font-size: vars.$font_small;
    font-weight: bold;
    margin: 16px 20px 16px 20px;
    span {
      margin-left: 5px;
      font-size: vars.$font_medium;
    }
  }

  top: -1vh;
}

</style>

