<script lang="ts">
import {queryString} from '../ts/store'
</script>

<!-- '$' is used to pass a store as writable -->
<input type="text" placeholder="Search..." bind:value={$queryString}/>

<style lang="scss">
input {
  font-size: 22px;
  text-align: center;
  margin: 1vh 0 1vh 0;
  padding: 15px 0 15px 0;
  color: var(--white);
  background-color: rgba(47, 52, 63, 0.5);
  border: 0;
  outline: 0;
  border-radius: 5%;
}
</style>
