<script lang="ts">
  import type { PassItem } from "../ts/types";
  import { showPassStore } from "../ts/store";

  let container: HTMLDivElement

  // The <span/> content disappears mid-animation which triggers a change in
  // geometry, to avoid this we use transparent placeholder text on:blur.
  showPassStore.subscribe( (passItem: PassItem) => {
      if (container) {
          container.style.color = passItem.path == "" ? "transparent" : "inherit"
      }
  })
  const spanWidth = 20
</script>

<div bind:this="{container}">
  <span>{$showPassStore.path == "" ? "*".repeat(spanWidth) :
         $showPassStore.path}</span>
  <span>
    {$showPassStore.password == "" ? "*".repeat(spanWidth) :
     $showPassStore.password}
  </span>
</div>

<style lang="scss">
@use "../scss/vars";

div {
    text-align: center;
    font-size: vars.$font_medium;
    display: grid;
    grid-template-columns: 1fr;
    padding: 10px 0px 10px 0px;

    span {

        &:first-child {
            margin-bottom: 10px;
            border-bottom: 2px solid vars.$lilac;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        &:nth-child(2) {
            font-size: vars.$font_small;
            overflow-wrap: anywhere;
        }
    }
}

</style>


