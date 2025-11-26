<script lang="ts">
  import { global } from "$lib/global.svelte";
  import { getLoadingUrl } from "$lib/util";
  import { onMount } from "svelte";
  let imageIdx = $state(0);

  onMount(() => {
    imageIdx = Math.floor(Math.random() * global.database.loading.length);
  });
</script>

<div class="error-container">
  <div class="error-content">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you're looking for doesn't exist or has been moved.</p>
  </div>
  <div class="error-image">
    <img
      src={getLoadingUrl(global.database.loading[imageIdx])}
      alt="Loading comic from Stella Sora"
    />
  </div>
</div>

<style>
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    padding: 2rem;
    text-align: center;
  }

  .error-content {
    max-width: 600px;

    & h1 {
      font-size: 6rem;
      margin: 0;
      color: var(--primary);
    }

    & h2 {
      font-size: 2rem;
      margin-top: 0;
      margin-bottom: 1rem;
      color: var(--primary);
    }

    & p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      color: var(--secondary-text);
    }

    @media (max-width: 768px) {
      & h1 {
        font-size: 4rem;
      }

      & h2 {
        font-size: 1.5rem;
      }
    }
  }

  .error-image img {
    max-width: 300px;
    height: auto;
    border-radius: 8px;
    opacity: 0.8;
  }
</style>
