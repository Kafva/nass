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
  :global(div#dialog) {
    background-color: vars.$black;
  }

  div {
    text-align: center;
    font-size: vars.$font_medium;
    display: grid;
    grid-template-columns: 1fr;
    padding: 10px 0px 10px 0px;

    span {
       &:first-child {
          text-decoration: underline;
          margin-bottom: 10px;
       }
       &:nth-child(2) {
         font-size: vars.$font_small;
       }
    }
  }

</style>


