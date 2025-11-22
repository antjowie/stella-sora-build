<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";

  interface Props {
    title: string;
    content: Snippet;
    onClose: () => void;
  }

  const { title, onClose, content }: Props = $props();

  let modalElement: HTMLElement;

  // Focus the modal when it mounts to support escape key
  $effect(() => {
    if (modalElement) {
      modalElement.focus();
    }
  });

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
</script>

<div
  bind:this={modalElement}
  tabindex="0"
  class="modal-backdrop"
  role="dialog"
  aria-modal="true"
  onclick={handleBackdropClick}
  onkeydown={(e) => e.key === "Escape" && onClose()}
  transition:fade={{ duration: 200 }}
>
  <div class="modal-container">
    <div class="modal-header">
      <h2>{title}</h2>
      <button class="close-button" onclick={onClose}>&times;</button>
    </div>

    <div class="modal-body">
      {@render content()}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-container {
    background-color: var(--primary-bg);
    overflow: auto;
    border-radius: 1rem;
    max-width: 1200px;
    width: 100%;
    min-height: 90vh;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 1000;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: var(--secondary-bg);
    border-bottom: 12px solid var(--bg-stripe);
  }

  .modal-header h2 {
    color: var(--white);
    margin: 0;
  }

  .modal-body {
    padding: 1rem 1.5rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #f9f9f7;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
</style>
