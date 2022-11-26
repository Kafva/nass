<script lang="ts">
  import { Config } from "../ts/config";
</script>

<div>
  <img alt="nass icon" width=42 height=42 src="/app/assets/icon.png">
  <h1>nass</h1>
  <p>A web interface for pass, <i>"the standard unix password manager"</i></p>
  <a rel="noreferrer" href="https://github.com/Kafva/nass" target="_blank">https://github.com/Kafva/nass</a>
</div>

<ul>
  <li>Latin alphanumerics and <code>[-_.@/]</code> are allowed in path names (1-{Config.textMaxLen} characters).</li>
  <li><code>'/'</code> can be used to create folders up to a depth of {Config.maxPassDepth}.</li>
  <li>Authentication requests are triggered sporadically based on if a cached
  password is available.</li>
</ul>

<style lang="scss">
  @use "../scss/vars";

  div {
    text-align: center;
    h1 {
      margin-bottom: 5px;
    }
    a {
      font-style: italic;
      color: vars.$pink;
    }
  }

  ul {
    list-style-type: disc;
    font-size: vars.$font_small;
    display: inline-block;
    width: calc(vars.$dialog_width - 10px);
    @include vars.tiny-mobile {
      width: inherit;
    }
    text-align: left;
    padding: 10px;
    li {
      margin-left: 20px;
    }
  }

</style>


