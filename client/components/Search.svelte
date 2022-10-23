<script lang="ts">
import {queryString} from '../ts/store'
</script>

<!-- '$' is used to pass a store as writable -->
<input type="text" placeholder="Search..." bind:value={$queryString}/>

<style lang="scss">
@use "../scss/vars";

input {
  font-size: vars.$font_large;
  text-align: center;
  margin: 1vh 0 1vh 0;
  padding: 15px 0 15px 0;
  color: vars.$white;
  background-color: vars.$grey;
  border: 0;
  outline: 0;
  border-radius: 5%;
}
</style>
