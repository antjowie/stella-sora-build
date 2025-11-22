<script lang="ts">
  import { global } from "$lib/global.svelte";
  import ItemSelect from "./ItemSelect.svelte";
  import DiscButton from "./DiscButton.svelte";

  interface Props {
    excludedIds?: number[];
    clickOverride?: (id: number) => void;
  }

  const { excludedIds = [], clickOverride }: Props = $props();
  const items = global.database.discs.map((disc) => ({
    id: disc.id,
    name: disc.name,
    element: disc.element,
    rarity: disc.rarity,
  }));
</script>

<ItemSelect {excludedIds} {items}>
  {#snippet item(id)}
    <DiscButton
      disc={global.database.discs.find((d) => d.id === id)!}
      {clickOverride}
    />
  {/snippet}
</ItemSelect>
