<script lang="ts">

</script>



<ul>
  <li>Latin alphanumerics and <code>[-_.@/]</code> are allowed in path names.</li>
  <li><code>'/'</code> can be used to create folders.</li>
</ul>

<style lang="scss">
@use "../scss/vars";

  ul {
    list-style-type: disc;
    font-size: vars.$font_small;
    display: inline-block;
    width: 20vw;
    text-align: left;
    background-color: vars.$black;
    border-radius: 0%;
    border: 1px dotted;
    border-color: vars.$white;
    padding: 10px;
    li {
      margin-left: 20px;
    }
  }

</style>


