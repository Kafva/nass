<script lang="ts">
  import { showPassStore } from "../ts/store";
</script>

<div>
  <span>{$showPassStore.path}</span>
  <span>{$showPassStore.password}</span>
</div>

<style lang="scss">
  @use "../scss/vars";
  div {
    text-align: left;
    font-size: vars.$font_medium;
    display: grid;
    grid-template-columns: 1fr;
    padding: 10px 0px 10px 0px;

    span {
       font-size: vars.$font_large;
       margin: 0 8px 0 0;
    }
  }

</style>


