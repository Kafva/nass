<script lang="ts">
  import { queryStringStore } from '../ts/store'
</script>

<!-- '$' is used to pass a store as writable -->
<input type="text" placeholder="Search..." bind:value={$queryStringStore}/>

<style lang="scss">
  @use "../scss/vars";
  
  input {
    @include vars.input-style;
    font-size: vars.$font_large;
    text-align: center;
    margin-top: 1vh;
    margin-bottom: 1vh;
    padding: 15px 0 15px 0;
  }
</style>
