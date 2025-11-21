<script lang="ts">
  import { global } from "$lib/global.svelte";
  import FilteredItemSelect from "./FilteredItemSelect.svelte";
  import type { Disc } from "$lib/types/database.types";
  import DiscButton from "./DiscButton.svelte";

  interface Props {
    excludedIds?: number[];
    clickOverride?: (disc: Disc) => void;
  }

  const { excludedIds = [], clickOverride }: Props = $props();
  const items = global.database.discs.map((disc) => ({
    id: disc.id,
    name: disc.name,
    element: disc.element,
    rarity: disc.rarity,
  }));
</script>

<FilteredItemSelect {excludedIds} {items}>
  {#snippet item(id)}
    <DiscButton
      disc={global.database.discs.find((d) => d.id === id)!}
      {clickOverride}
    />
  {/snippet}
</FilteredItemSelect>
