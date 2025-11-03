<script lang="ts">
  import type {  Character } from '$lib/database.types';
  import { CharacterElement, characterGradeColor, characterElementColor, characterClassColor, CharacterClass  } from './database.svelte';
  import { scale } from 'svelte/transition';
  import { resolve } from '$app/paths';

let {character}: {character: Character} = $props();
</script>

<a
	class="button"
	href={resolve(`/database/${character.name}`)}
	data-sveltekit-preload-data="hover"
	transition:scale
	style:--grade-color={characterGradeColor[character.grade]}
	style:background-image="url({character.portraitUrl})"
    style:background-repeat="no-repeat"
    style:background-size="110%"
    style:background-position="50% 0%"
	>
	<div class="character-info">
    <li
        style:background-color="{characterElementColor[character.element]}"
    >
            {CharacterElement[character.element]}</li>
    <li
        style:background-color="{characterClassColor[character.class]}"
    >
            {CharacterClass[character.class]}</li>
	</div>
	<div class="character-name">
	    <p>{character.name}</p>
	</div>
</a>

<style>
	.button {
        display: grid;
        overflow: hidden;
        grid-template-rows: 1fr 6fr;
        background-color: #f0f7fa;
        text-decoration: none;
        border-radius: 0.5rem;
        transition: transform 0.2s;
        min-height: 16rem;
        border-top: solid 0.5rem var(--grade-color);
        border-bottom: solid 1.5rem var(--grade-color);
        box-shadow: 0 4px 0 rgba(0,0,0, 0.2);
        position: relative;
    }

    .button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(240, 247, 250, 0.6);
        background: linear-gradient(to top,
        rgba(240, 247, 250, 0.8) 10%,
        rgba(240, 247, 250, 0) 25%);
        pointer-events: none;
    }

    .button:hover {
        transform: scale(1.02);
    }

    .button:active:hover {
        background-color: #f1f1f1;
        transform: scale(0.9);
    }

    .character-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        z-index: 1;
    }

    .character-info li {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        /*text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white;*/
    }

    .character-name {
        position: relative;
        z-index: 1;
    }

    .character-name p {
        position: absolute;
        right: 10px;
        bottom: 0px;
        margin: 0;
    }
</style>
