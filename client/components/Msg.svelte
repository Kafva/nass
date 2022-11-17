<script lang="ts">
  import { MessageIcons, MessageTimeouts } from "../ts/config";
  import { msgTextStore } from "../ts/store";
  import { fly } from "../ts/util";

  let message = ""
  let iconClass = ""
  let timeoutID: any = null

  msgTextStore.subscribe( (value:[string,string]) => {
    const timeout = MessageTimeouts[value[0]] || -1
    message = value[1] == "" ? value[0] : value[0] + " " + value[1]
    iconClass = MessageIcons[value[0]] || ""

    // Cancel the current timeout if one is already in progress
    if (timeoutID != null) {
      clearTimeout(timeoutID)
    }

    if (timeout > 0) {
      timeoutID = setTimeout(() => {
        msgTextStore.set(["",""])
        timeoutID = null
      }, timeout)
    }
  })
</script>

{#if message.length != 0}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div role="button"
       transition:fly="{{ from: 'bottom', percent: 125, duration: 200 }}"
       on:click="{()=> msgTextStore.set(['','']) }">
       <p title={message}>
        <span class="{'nf '+ iconClass}"/> {message}
      </p>
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

    @include vars.mobile {
      width: vars.$msg_width_mobile;
      @include vars.fixed-centering(vars.$msg_width_mobile, 20px);
    }

    p {
      font-size: vars.$font_small;
      font-weight: bold;
      margin: 16px 20px 16px 20px;

      text-overflow: ellipsis;
      overflow: hidden;
      overflow-wrap: break-word;
      hyphens: auto;

      span {
        margin-right: 10px;
        font-size: vars.$font_medium;
      }
    }

    // Messages appear at the bottom of the screen so that they
    // do not overlap with the search bar.
    // The fly-effect uses a percentage >100% because of the placement.
    top: 100%;
  }
</style>

