<script lang="ts">
  import { toasts } from '$lib/toastStore';
    import { flip } from 'svelte/animate';
    import { fade, fly } from 'svelte/transition';

  function dismiss(id: string) {
    toasts.update(all => all.filter(t => t.id !== id));
  }
</script>

<div class="toast-container">
  {#each $toasts as toast (toast.id)}
    <div class="toast {toast.type}"
        in:fly={{ duration: 300, y: -100 }}
        out:fade={{ duration: 150 }}
        animate:flip={{ duration: 150}}
    >
      {toast.message}
      <button class="close" on:click={() => dismiss(toast.id)}>X</button>
      <div
        class="progress"
        style="animation-duration: {toast.duration ?? 3000}ms"
      >
      </div>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 2.5%;
    left: 50%;
    transform: translate(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .toast {
    position: relative;
    margin-bottom: 0.5rem;
    padding: 1rem;
    border-radius: 6px;
    color: var(--secondary);
    overflow: hidden;
  }
  .info { background-color: #2196f3; }
  .success { background-color: var(--green); }
  .error { background-color: var(--red); }

  .close {
    background: none;
    border: none;
    color: var(--secondary);
    cursor: pointer;
    padding: 0.5rem;
  }

  .progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background: rgba(255,255,255,0.6);
    animation: shrink linear forwards;
  }

  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
</style>
