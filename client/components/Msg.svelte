<script lang="ts">
  import { MessageIcons, MessageTimeouts } from "../ts/config";
  import { msgTextStore } from "../ts/store";
  import { fly, IsMobile } from "../ts/util";

  let message = ""
  let iconClass = ""
  let timeoutID: any = null
  const percent = IsMobile() ? -125 : -140

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
  <!-- svelte-ignore a11y-interactive-supports-focus -->
  <div role="button"
       transition:fly="{{ percent: percent, duration: 200 }}"
       on:click="{()=> msgTextStore.set(['','']) }">
       <p title={message}>
        <span class="{'nf '+ iconClass}"/> {message}
      </p>
  </div>
{/if}


<style lang="scss">
@use "../scss/vars";

div {
    text-align: center;
    position: fixed;
    border-radius: 2%;
    color: vars.$white;
    z-index: vars.$msg_z;
    background-color: vars.$dialog_bg;
    border: 2px dotted vars.$lilac;

    width: vars.$msg_width;
    @include vars.fixed-centering(vars.$msg_width, 0px);

    @include vars.mobile {
        width: vars.$msg_width_mobile;
        @include vars.fixed-centering(vars.$msg_width_mobile, 0px);
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

