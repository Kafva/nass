<script lang="ts">
    import { fade } from '../ts/util';
    import { loadingTextStore } from '../ts/store'
</script>

{#if $loadingTextStore != ""}
  <div id="loadingCover" transition:fade="{{ limit: 0.8, delay: 300, duration: 200 }}">
        <p>{$loadingTextStore}</p>
    </div>
{/if}

<style lang="scss">
@use "../scss/vars";
div#loadingCover {
    z-index: vars.$loading_z;
    position: fixed;
    left:0;
    top:0;
    width: 100vw;
    height: 100vh;
    background-color: vars.$black;
}

p {
    position: fixed;
    text-align: center;
    width: vars.$msg_width;
    font-size: vars.$font_medium;
    top: 30%;

    @include vars.fixed-centering(vars.$msg_width, 0px);

    @include vars.mobile {
        width: vars.$msg_width_mobile;
        @include vars.fixed-centering(vars.$msg_width_mobile, 0px);
    }
}
</style>
