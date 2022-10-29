<script lang="ts">
import Config from "../ts/config";
import { msgText } from "../ts/store";
import { MessageIcons } from "../ts/types";
import { fly } from "../ts/util";

let message = ""
let iconClass = ""
let timeoutID: any = null

msgText.subscribe( (value:[string,string]) => {
  message = value[1] == "" ? value[0] : value[0] + " " + value[1]
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
  <div transition:fly="{{ from: 'bottom', vh: 8, duration: 200 }}">
    <p><span class="{'nf '+ iconClass}"/> {message} </p>
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

  width: vars.$msg_width;
  @include vars.fixed-centering(vars.$msg_width, 20px);

  @include vars.mobile{
    width: vars.$msg_width_mobile;
    @include vars.fixed-centering(vars.$msg_width_mobile, 20px);
  }

  p {
    font-size: vars.$font_small;
    font-weight: bold;
    margin: 16px 20px 16px 20px;

    width: calc(vars.$msg_width - 40px);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;

    span {
      margin-right: 10px;
      font-size: vars.$font_medium;
    }
  }

  // Messages appear at the bottom of the screen so that they
  // do not overlap with the search bar
  top: 100vh;
}

</style>

