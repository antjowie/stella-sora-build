<script lang="ts">
  interface Props {
    value: number;
    max: number;
    text: string;
  }

  let { value = $bindable<number>(), max, text }: Props = $props();

  let isSticky = $state(false);
  function observeSticky(node: HTMLElement) {
    const observer = new IntersectionObserver(([entry]) => {
      isSticky = !entry.isIntersecting;
    });

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }
</script>

<div use:observeSticky style="height: 1px;"></div>
<div class="slider interact-background" class:stuck={isSticky}>
  <label for="slider">{text}{value}</label>
  <input id="slider" type="range" min="1" max={max ?? 1} bind:value step="1" />
</div>

<style>
  .slider {
    position: sticky;
    top: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin: 0.5rem 0;
    max-width: 250px;
    z-index: 10;

    & > input {
      padding: 0;
    }
  }

  .stuck {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
</style>
