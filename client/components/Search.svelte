<script lang="ts">
  import { FoldPolicy } from '../ts/types'
  import { foldPolicyStore, queryStringStore, visibleButtonsStore } from '../ts/store'
</script>

<!-- '$' is used to pass a store as writable. -->
<input type="text" placeholder="Search..." bind:value={$queryStringStore}
       on:focus="{() => { 
        foldPolicyStore.set(FoldPolicy.allOpen) 
        visibleButtonsStore.set('')
}}"/>

<style lang="scss">
  @use "../scss/vars";

  input {
    @include vars.input-style;
    font-size: vars.$font_large;
    text-align: center;
    margin-top: 1vh;
    margin-bottom: 1vh;
    padding: 15px 0 15px 0;
    width: 100%;
  }
</style>
