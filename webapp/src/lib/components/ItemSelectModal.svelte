<script lang="ts">
  import type { Snippet } from "svelte";
  import Modal from "./Modal.svelte";

  interface Props {
    title: string;
    button: Snippet<[number[], (id: number) => void]>;
    onSelect: (id: number) => void;
    onClose: () => void;
    excludedIds: number[];
  }

  const { title, button, onSelect, onClose, excludedIds }: Props = $props();

  function handleSelect(id: number) {
    onSelect(id);
  }
</script>

<Modal {title} {onClose}>
  {#snippet content()}
    {@render button(excludedIds, handleSelect)}
  {/snippet}
</Modal>
