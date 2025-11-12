<script lang="ts">
  import { base } from "$app/paths";
  import { PotentialRarity, potentialRarityColor } from "$lib/database";
  import type { Potential } from "$lib/database.types";
  import { addToast } from "$lib/toastStore";
  import potentialBorder from "$lib/assets/borders/potential-border.webp";
  import potentialBorderActive from "$lib/assets/borders/potential-border-active.webp";
  import potentialBorderEdged from "$lib/assets/borders/potential-border-edged.webp";
  import potentialBorderEdgedActive from "$lib/assets/borders/potential-border-edged-active.webp";

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

  const scale = 0.4;
  const borderImage = $derived(showDesc || editMode ?
    `url("${active ? potentialBorderActive : potentialBorder}") 80 fill / ${scale * 80}px`:
    `url("${active ? potentialBorderEdgedActive : potentialBorderEdged}") 80 80 80 205 fill / ${scale * 80}px ${scale * 80}px ${scale * 80}px ${scale * 205}px`);
  const showDescLayout = $derived(showDesc || editMode);
</script>

<link rel="preload" as="image" href="{potentialBorder}"/>
<link rel="preload" as="image" href="{potentialBorderActive}"/>
<link rel="preload" as="image" href="{potentialBorderEdged}"/>
<link rel="preload" as="image" href="{potentialBorderEdgedActive}"/>

<button
    class="potential
    { onClicked && blockClick ? "disabled" : ""}
    { onClicked ?
      (active ? "active" : "inactive")
      : "default"}"
    style:--color={potentialRarityColor[potential.rarity]}
    style:border-image={borderImage}
    style:padding="28px"
    onclick={() => { handleOnClick(); }}
>
    <!-- Put name first or after level based on layout for proper selection logic -->
    {#if showDescLayout}
    <p class="name">
        <span>{potential.name}</span>
    </p>
    {/if}
    <div class="level {showDescLayout ? "showDesc" : "notShowDesc"}">
        Lv. {level}
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
    {#if showDescLayout === false}
    <p class="name">
        <span>{potential.name}</span>
    </p>
    {/if}
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
        transition: transform 0.2s;
        padding: var(--padding);
        background-color: var(--color);

        /* To add radius the border-image */
        mask-image: radial-gradient(circle at center, black 99%, transparent 100%);
        mask-composite: intersect;
        border-radius: 5px;
        -webkit-mask-image: radial-gradient(circle at center, black 99%, transparent 100%);
        -webkit-mask-composite: destination-in;
        /*filter: drop-shadow(0px 4px 0px rgba(0, 0, 0, 0.2));*/
    }

    .potential .name {
        font-weight: 700;
        text-align: center;
    }

    .potential .level {
        position: relative;
        font-weight: 700;
        align-self: center;
    }

    .potential .level.showDesc {
        margin: 0.5rem 0 0 0;
        width: 80%;
        background-color: white;
    }

    .potential .level.notShowDesc {
        position: absolute;
        top: 5px;
        left: 2px;
        width: 64px;
        height: calc(var(--padding));
    }

    .potential.active .level.notShowDesc {
        color: white !important;
        /* Not sure if it fits but if it's to unreadable we can add shadow */
        /*text-shadow: 0 0 2px var(--primary);*/
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
