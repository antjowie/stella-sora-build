<script lang="ts">
  import { base } from "$app/paths";
  import { PotentialRarity, potentialRarityColor } from "$lib/database";
  import type { Potential } from "$lib/database.types";
  import { addToast } from "$lib/toastStore";

  interface Props {
    potential: Potential;
    showBrief: boolean;
    showDesc: boolean;
    activePotentialIds?: number[];
    blockClick?: string;
    onClicked?: (id: number) => void;
    editMode: boolean;
    blockExceedMaxLevel?: string;
    level?: number
    onLevelChanged?: (id: number, level: number) => void;
  };

  let {
    potential,
    showBrief,
    showDesc,
    activePotentialIds = [],
    blockClick = undefined,
    onClicked,
    editMode,
    blockExceedMaxLevel = undefined,
    level = -1,
    onLevelChanged }: Props = $props();
  const active = $derived(activePotentialIds.includes(potential.id));
  const maxLevel = potential.rarity === PotentialRarity.Main ? 1 : 6;
  const localMaxLevel = $derived((level > maxLevel || blockExceedMaxLevel === undefined) ? maxLevel + 3 : maxLevel);

  if (level === -1 || level === undefined) {
    // svelte-ignore state_referenced_locally
    level = maxLevel;
  }

  // TODO: actually query the param values from potentials
  const replaceText = (text: string) => {
    return text
      .replace(/<color[^>]*>.*?<\/color>/g, 'X') // Replace color tags with 'x'
      .replace(/&[^&]*&/g, 'Y') // Replace special characters with 'x'
      .replace(/##([^#]+)#[^#]*#/g, '$1') // Replace ##content#xxxx# patterns with just the content
    ;
  };

  function handleLevelChange(event: Event) {
    const target = event.target as HTMLDivElement;
    const value = target.textContent;
    let newLevel = level;
    if (value === "++") {
      if (level < maxLevel) {
        newLevel = maxLevel;
      }
      else
      {
        // +1 to trigger over max for toast
        newLevel = localMaxLevel + 1;
      }
    } else if (value === "+") {
      newLevel = level + 1;
    } else if (value === "−−") {
      newLevel = level - 10;
    } else if (value === "−") {
      newLevel = level - 1;
    }

    if (newLevel < 1) {
      newLevel = 1;
    } else if (newLevel > localMaxLevel) {
      newLevel = localMaxLevel;
      if (localMaxLevel == maxLevel && blockExceedMaxLevel) {
        addToast({message: blockExceedMaxLevel, type: "error"});
      }
    }

    if (newLevel !== level) {
      level = newLevel;
      onLevelChanged?.(potential.id, level);
    }
    event.stopPropagation();
  }

  function handleOnClick() {
     if(onClicked)
     {
       if (blockClick)
       {
         addToast({message: blockClick, type: "error"});
       }
       else
       {
         onClicked(potential.id);
       }
     }
  }
</script>

<button
    class="potential
    { onClicked && blockClick ? "disabled" : ""}
    { onClicked ?
      (active ? "active" : "inactive")
      : "default"}"
    style:--color={potentialRarityColor[potential.rarity]}
    style:border-image="url({`${base}/potential-border${active ? "-active" : ""}.svg`}) 15% / var(--border-size) / 0px stretch"
    onclick={() => { handleOnClick(); }}
>
    <p class="name">
        {#if showDesc === false}
        <span>Lv. {level} </span>
        {/if}
        <span>{potential.name}</span>
    </p>
    <div class="level {editMode || showDesc ? "showDesc" : "notShowDesc"}">
        <span>Lv. {level}</span>
        {#if editMode}
        <div class="edit level">
            <div class={level == 1 ? "disabled" : ""} onclick={(event) => { handleLevelChange(event); }}>−−</div>
            <div class={level == 1 ? "disabled" : ""} onclick={(event) => { handleLevelChange(event); }}>−</div>
            <span>Lv. {level}</span>
            <div class={blockExceedMaxLevel !== undefined && level == localMaxLevel ? "disabled" : ""} onclick={(event) => { handleLevelChange(event); }}>+</div>
            <div class={blockExceedMaxLevel !== undefined && level == localMaxLevel ? "disabled" : ""} onclick={(event) => { handleLevelChange(event); }}>++</div>
        </div>
        {/if}
    </div>
{#if showDesc}
    <p class="description">{replaceText(showBrief ? potential.descShort : potential.descLong)}</p>
{/if}
</button>

<style>
    .disabled{
        /*pointer-events: none;*/
        opacity: 0.5 !important;
        cursor: not-allowed;
        transform: scale(1) !important;
    }

    .default:hover {
        transform: scale(1);
        cursor: auto;
    }

    .potential {
        --radius: 5px;
        --padding: 20px;
        --border-size: 32px;
        position: relative;
        display: flex;
        flex-direction: column;
        align-content: start;
        user-select: text;
        transition: 0.2s;
        padding: var(--padding);
        background-color: var(--color);
        filter: drop-shadow(0px 4px 0px rgba(0, 0, 0, 0.2));
    }

    .potential .name {
        font-weight: 700;
        text-align: center;
    }

    .potential .level {
        position: relative;
        font-weight: 700;
        align-self: center;
        background-color: white;
        user-select: none;
    }

    .potential .level.showDesc {
        margin: 0.5rem 0 0 0;
        width: 80%;
    }

    .potential .level.notShowDesc {
        /* For now we hide this, need to fix the visuals */
        visibility: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 64px;
        height: calc(var(--padding));
    }

    .potential .edit {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        align-items: center;
        width: 100%;
        height: 100%;
        z-index: 100;
    }

    .potential .edit div{
        background-color: var(--primary-bg-dark);
        padding: 0 4px;

    }

    .potential .description {
        text-align: left;
        margin: 0.5rem 0 0 0;
    }

    .active {
        --border-color: var(--green);
        filter: grayscale(0);
        box-shadow:
            inset var(--radius) var(--radius) var(--border-color),
            inset var(--radius) calc(-1 * var(--radius)) var(--border-color),
            inset calc(-1 * var(--radius)) calc(-1 * var(--radius)) var(--border-color),
            inset calc(-1 * var(--radius)) var(--radius) var(--border-color)
            ;
    }

    .inactive {
        --border-color: white;
        filter: grayscale(0.5);
    }

    .active:hover:active, .inactive:hover:active {
        transform: scale(1);
    }

    .active:hover, .inactive:hover {
        transform: scale(1.05);
    }
</style>
