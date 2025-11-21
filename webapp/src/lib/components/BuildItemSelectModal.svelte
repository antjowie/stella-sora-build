<script lang="ts">
  import CharacterSelect from "$lib/components/CharacterSelect.svelte";
  import type { Character } from "$lib/types/database.types";
  import Modal from "./Modal.svelte";

  interface Props {
    onSelect: (character: Character) => void;
    onClose: () => void;
    excludedIds: number[];
  }

  const { onSelect, onClose, excludedIds }: Props = $props();

  function handleSelect(character: Character) {
    onSelect(character);
  }
</script>

<Modal title="Select Character" {onClose}>
  {#snippet content()}
    <CharacterSelect {excludedIds} clickOverride={handleSelect} />
  {/snippet}
</Modal>
