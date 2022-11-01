<script lang="ts">
  import { showPassStore } from "../ts/store";
  // FIXME The out-fade looks bad since the <span> content disappears mid-animation
</script>

<div>
  <span>{$showPassStore.path}</span>

  <span>
   <span class="nf nf-mdi-subdirectory_arrow_right"/>
    {$showPassStore.password}
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
       font-size: vars.$font_large;

       &:first-child:not(.nf) {
          text-decoration: underline;
          margin-bottom: 10px;
       }
    }
  }

</style>


