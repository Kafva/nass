<script lang="ts">
  //import { showPassValues } from "../ts/store";
  //import { onDestroy } from "svelte";

  //onDestroy( () => {
  //  // Clear on close TODO
  //  showPassValues.set(["",""])
  //})

  // No escape???

  export let path: string;
  export let password: string;

</script>

<span>{path.slice(1)}</span>
<span>{password}</span>

<style lang="scss">
  @use "../scss/vars";
</style>


