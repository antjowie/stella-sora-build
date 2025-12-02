<script lang="ts">
  import FAQButton from "$lib/components/FAQButton.svelte";
</script>

<div class="container">
  <div class="content">
    <h1>About</h1>
    <p>
      Stella builds is a site where you can create, save and share builds made
      for your Ascension runs. When starting a run, you can view a build and
      keep track of the potentials you've collected.
    </p>

    <h1>Resources</h1>
    <p>List of handy community resources I use</p>
    <ul>
      <li>
        <a
          href="https://docs.google.com/spreadsheets/d/1otsS2C1RkXLaFSvp2SMOS-vtRBaEBpZlcgR361_fdAE/edit?usp=sharing"
          target="_blank">Mistique's Field Reports (Stella Sora INFODOC)</a
        >
      </li>
      <li>
        <a href="https://stelladb.pages.dev" target="_blank"
          >stelladb (Character and Disc data website)</a
        >
      </li>
    </ul>

    <h1>FAQ</h1>
    <FAQButton title="Where can I request features or report bugs?">
      You can create an issue on <a
        href="https://github.com/antjowie/stella-sora-build/issues"
        onclick={(e) => e.stopPropagation()}
        target="_blank">GitHub</a
      >
      or join the
      <a
        href="https://discord.com/channels/1296014241089978408/1438308343335878708"
        onclick={(e) => e.stopPropagation()}
        target="_blank">Discord thread</a
      >.
    </FAQButton>
    <FAQButton title="How does the site stay up to date?">
      The game assets are automatically updated on an interval. Whenever new
      assets are detected the site is automatically deployed. For more info see
      the <a
        href="https://github.com/antjowie/StellaSoraData"
        onclick={(e) => e.stopPropagation()}
        target="_blank">GitHub repository</a
      >.
    </FAQButton>
    <FAQButton title="How are builds stored?">
      Currently builds are stored in your browser's local storage. This means
      that your builds are only accessible on the device you are using and will
      be lost if you clear your browser's cache or switch to a different device.
      I'd advice to regularly export your builds.
    </FAQButton>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  @media (min-width: 768px) {
    .content {
      width: 80vw;
    }
  }

  h1:not(:first-child) {
    margin-top: 1rem;
  }

  li {
    margin-left: 1em;
  }
</style>
