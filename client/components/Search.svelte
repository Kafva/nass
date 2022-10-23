<script lang="ts">
import {queryString} from '../ts/store'

</script>

<!-- '$' is used to pass a store as writable -->
<input type="text" placeholder="Search..." bind:value={$queryString}/>

<style lang="scss">
input {
  text-align: center;
  margin: 1vh 0 1vh 0;
  padding: 10px 0 10px 0;
}
</style>
