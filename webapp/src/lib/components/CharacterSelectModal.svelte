<script lang="ts">
  import CharacterSelect from "$lib/components/CharacterSelect.svelte";
  import type { Character } from "$lib/database";
  import Modal from "./Modal.svelte";

  interface Props {
    onSelect: (character: Character) => void;
    onClose: () => void;
    excludedCharacters: number[];
  }

  let { onSelect, onClose, excludedCharacters }: Props = $props();

  function handleSelect(character: Character) {
    onSelect(character);
  }
</script>

<Modal title="Select Character" {onClose}>
  {#snippet content()}
    <CharacterSelect {excludedCharacters} clickOverride={handleSelect} />
  {/snippet}
</Modal>
