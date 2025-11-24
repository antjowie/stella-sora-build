<script lang="ts">
  interface Props {
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    scale: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
    mode?: "image" | "mask";
    borderColor?: string;
    borderRadius?: number;
  }

  const {
    imageUrl,
    imageWidth,
    imageHeight,
    scale,
    top,
    right,
    bottom,
    left,
    mode = "image",
    borderColor = "transparent",
    borderRadius = 0,
  }: Props = $props();
</script>

<!-- Image based 9slice because html-to-image doesn't support border-image -->
<div
  class="nine-slice {mode}"
  style="
    --imageUrl: url({imageUrl});
    --inImageWidth: {imageWidth}px;
    --inImageHeight: {imageHeight}px;
    --inScale: {scale};
    --inTop: {top}px;
    --inRight: {right}px;
    --inBottom: {bottom}px;
    --inLeft: {left}px;
    --inRadius: {borderRadius}px;
    --border-color: {borderColor};
    "
>
  <div class="corner tl"></div>
  <div class="edge top"></div>
  <div class="corner tr"></div>

  <div class="edge left"></div>
  <div class="center"></div>
  <div class="edge right"></div>

  <div class="corner bl"></div>
  <div class="edge bottom"></div>
  <div class="corner br"></div>
</div>

<style>
  .nine-slice {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr auto;
    width: 100%;
    height: 100%;

    --width: calc(var(--inImageWidth) * var(--inScale));
    --height: calc(var(--inImageHeight) * var(--inScale));
    --scale: calc(var(--inScale) * var(--inScale));
    --top: calc(var(--inTop) * var(--inScale));
    --right: calc(var(--inRight) * var(--inScale));
    --bottom: calc(var(--inBottom) * var(--inScale));
    --left: calc(var(--inLeft) * var(--inScale));
    --radius: calc(var(--inRadius) * var(--inScale));
  }
  .corner,
  .edge,
  .center {
    background-repeat: no-repeat;
    /*margin: -1px;*/
  }

  /* IMAGE MODE */
  .nine-slice.image .corner,
  .nine-slice.image .edge,
  .nine-slice.image .center {
    background-image: var(--imageUrl);
  }

  /* MASK MODE */
  .nine-slice.mask .corner,
  .nine-slice.mask .edge,
  .nine-slice.mask .center {
    -webkit-mask-image: var(--imageUrl);
    mask-image: var(--imageUrl);

    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;

    background-color: currentColor;
    transition: 0.2s;
  }

  .corner {
    background-size: var(--width) var(--height);
    -webkit-mask-size: var(--width) var(--height);
    mask-size: var(--width) var(--height);
  }

  /* Corners (fixed size) */
  .corner.tl {
    width: var(--left);
    height: var(--top);
    background-position: 0 0;
    -webkit-mask-position: 0 0;
    mask-position: 0 0;
    box-shadow: inset var(--radius) var(--radius) var(--border-color);
  }
  .corner.tr {
    width: var(--right);
    height: var(--top);
    background-position: calc(var(--width) * -1 + var(--right)) 0;
    -webkit-mask-position: calc(var(--width) * -1 + var(--right)) 0;
    mask-position: calc(var(--width) * -1 + var(--right)) 0;
    box-shadow: inset calc(-1 * var(--radius)) var(--radius) var(--border-color);
  }
  .corner.bl {
    width: var(--left);
    height: var(--bottom);
    background-position: 0 calc(var(--height) * -1 + var(--bottom));
    -webkit-mask-position: 0 calc(var(--height) * -1 + var(--bottom));
    mask-position: 0 calc(var(--height) * -1 + var(--bottom));
    box-shadow: inset var(--radius) calc(-1 * var(--radius)) var(--border-color);
  }
  .corner.br {
    width: var(--right);
    height: var(--bottom);
    background-position: calc(var(--width) * -1 + var(--right))
      calc(var(--height) * -1 + var(--bottom));
    -webkit-mask-position: calc(var(--width) * -1 + var(--right))
      calc(var(--height) * -1 + var(--bottom));
    mask-position: calc(var(--width) * -1 + var(--right))
      calc(var(--height) * -1 + var(--bottom));
    box-shadow: inset calc(-1 * var(--radius)) calc(-1 * var(--radius))
      var(--border-color);
  }

  /* Edges (stretchable) */
  .edge {
    /*background-repeat: repeat;*/
    /*
    * NOTE, this is technically incorrect, we should move bg to the left but
    * if the elem width is bigger than the sprite width, the edges get stretched
    * causing the corners to leak in. For my use case I'll just make them extra
    * big to avoid the issue. Might be worth wrapping it inside a svg and using
    * some clip logic
    *
    * A value of 5 means our max width is 5x the sprite width
    */
    --edge-scale: 50;
  }
  .edge.top {
    background-position: calc(var(--left) * var(--edge-scale) * -1) 0;
    /*background-size: calc(var(--width) + var(--left)) var(--height);*/
    background-size: calc(var(--width) * var(--edge-scale)) var(--height);
    -webkit-mask-position: calc(var(--left) * var(--edge-scale) * -1) 0;
    mask-position: calc(var(--left) * var(--edge-scale) * -1) 0;
    -webkit-mask-size: calc(var(--width) * var(--edge-scale)) var(--height);
    mask-size: calc(var(--width) * var(--edge-scale)) var(--height);
    box-shadow: inset 0 var(--radius) var(--border-color);
  }
  .edge.bottom {
    background-position: calc(var(--left) * var(--edge-scale) * -1)
      calc(var(--height) * -1 + var(--bottom));
    background-size: calc(var(--width) * var(--edge-scale)) var(--height);
    -webkit-mask-position: calc(var(--left) * var(--edge-scale) * -1)
      calc(var(--height) * -1 + var(--bottom));
    mask-position: calc(var(--left) * var(--edge-scale) * -1)
      calc(var(--height) * -1 + var(--bottom));
    -webkit-mask-size: calc(var(--width) * var(--edge-scale)) var(--height);
    mask-size: calc(var(--width) * var(--edge-scale)) var(--height);
    box-shadow: inset 0 calc(-1 * var(--radius)) var(--border-color);
  }
  .edge.left {
    background-position: 0 calc(var(--top) * var(--edge-scale) * -1);
    background-size: var(--width) calc(var(--height) * var(--edge-scale));
    -webkit-mask-position: 0 calc(var(--top) * var(--edge-scale) * -1);
    mask-position: 0 calc(var(--top) * var(--edge-scale) * -1);
    -webkit-mask-size: var(--width) calc(var(--height) * var(--edge-scale));
    mask-size: var(--width) calc(var(--height) * var(--edge-scale));
    box-shadow: inset var(--radius) 0 var(--border-color);
  }
  .edge.right {
    background-position: calc(var(--width) * -1 + var(--right))
      calc(var(--top) * var(--edge-scale) * -1);
    background-size: var(--width) calc(var(--height) * var(--edge-scale));
    -webkit-mask-position: calc(var(--width) * -1 + var(--right))
      calc(var(--top) * var(--edge-scale) * -1);
    mask-position: calc(var(--width) * -1 + var(--right))
      calc(var(--top) * var(--edge-scale) * -1);
    -webkit-mask-size: var(--width) calc(var(--height) * var(--edge-scale));
    mask-size: var(--width) calc(var(--height) * var(--edge-scale));
    box-shadow: inset calc(-1 * var(--radius)) 0 var(--border-color);
  }

  /* Center (fill) */
  .center {
    /* Don't use center for my designs */
    opacity: 0;
  }
</style>
