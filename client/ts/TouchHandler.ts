import { visibleButtonsStore } from "./store";

/**
 * Max distance between the origin and end of a swipe for it
 * to be considered a click.
 */
const CLICK_LIMIT = 0.02

/** Maximum allowed distance to move from the origin */
const MAX_DISTANCE = 0.5

/** Lowest allowed value for text opacity */
const OPACITY_LOW_TIDE = 0.3;

const BG_OPACITY_MAX = 0.2;
const BG_COLOR = "25,25,24"

/** Handler for touch events on each item in the PasswordTree */
export default class TouchHandler {
  constructor(
    /**
     * Path to the `PassEntry` that this `TouchHandler` instance
     * is bound to.
     */
    private path: string,

    /** x coordinate origin of a new touch event. */
    private originX = 0,

    /** Opacity values at the start of a  new touch event. */
    private originOpacities = {left: 0, right: 0, bg: 0},

    /** Grid container, the last child is always the drawer element */
    public grid: HTMLDivElement|null = null
  ){}

  /** Platform check based on viewport width and UA */
  isMobile(): boolean {
    return navigator.userAgent.match(/iPhone|iPad|Android/i) != null
           && document.body.clientWidth <= 480
  }

  //private updateFontSize() {
  //  for (const child of this.grid.children) {
  //      const htmlChild = child as HTMLElement
  //      htmlChild.style.fontSize
  //  }

  //}

  /**
   * Update the position and right offset (-100, 100 %) of all elements in the
   * grid of the main container.
   */
  private updateOffset(position = "", right = 0) {
    if (this.grid != null) {
      for (const child of this.grid.children) {
        const htmlChild = child as HTMLElement
        if (position != "") {
          htmlChild.style.position = position
        }
        htmlChild.style.right = `${right}%`

        //// Update font size for buttons in the drawer
        //if (htmlChild.parentElement?.classList.contains("drawer")) {
        //  if (right > 0) { // [<---]
        //    htmlChild.style.fontSize = `${22*(right/100)}px`
        //  }
        //  else if (right < 0) { // [--->]
        //    htmlChild.style.fontSize = `${22*((1-right)/100)}px`
        //  }
        //  // right == 0 is skipped
        //}
      }
    }
  }
  private getOpacities(): {left: number, right: number, bg: number} {
    const name = this.grid!.children.item(1) as HTMLSpanElement
    const button =
      (this.grid!.lastChild as HTMLElement).children.item(0) as HTMLSpanElement
    const bg_splits = this.grid!.style.backgroundColor.split(',')
    const bg = bg_splits.length == 4 ?
      parseFloat(bg_splits[3].slice(0,-1)) : 0.0
    return {
      left: parseFloat(window.getComputedStyle(name).opacity),
      right: parseFloat(window.getComputedStyle(button).opacity),
      bg: bg
    }
  }

  private setBgOpacity(opacity: number) {
    this.grid!.style.backgroundColor =
      `rgba(${BG_COLOR},${Math.min(BG_OPACITY_MAX, opacity)})`
  }

  private setLeftOpacity(opacity: number) {
    if (this.grid != null) {
      const bounded_opacity =
        Math.min(1.0, Math.max(OPACITY_LOW_TIDE, opacity))

      const icon = this.grid.children.item(0) as HTMLSpanElement
      const name = this.grid.children.item(1) as HTMLSpanElement
      // !! Hide the icon completely to avoid clipping !!
      icon.style.opacity = opacity != 1.0 ? "0.0" : opacity.toString()
      name.style.opacity = bounded_opacity.toString()
    }
  }

  private setRightOpacity(opacity: number) {
    if (this.grid != null) {
      for (const child of (this.grid.lastChild as HTMLElement).children) {
        (child as HTMLSpanElement).style.opacity = opacity.toString()
      }
    }
  }

  start(event: TouchEvent) {
    if (!this.isMobile()) { return; }
    const touch = event.touches.item(0)
    if (touch) {
      // Save origin position and opacity
      this.originX = touch.pageX/window.innerWidth

      this.setLeftOpacity(OPACITY_LOW_TIDE)
      this.setRightOpacity(OPACITY_LOW_TIDE)

      this.originOpacities = this.getOpacities()
      this.updateOffset("relative")

      // Update the currently visible button, other PassEntry
      // objects will be notified of this and hide their buttons
      visibleButtonsStore.set(this.path)
    }
  }

  move(event: TouchEvent) {
    if (!this.isMobile()) { return; }
    const touch = event.touches.item(0)
    if (touch) {
      // 0.0: Far left
      // 1.0: Far right
      const newX = touch.pageX/window.innerWidth
      const distance = Math.min(MAX_DISTANCE,  Math.abs(newX - this.originX))

      if (newX > this.originX) {
        // On [--->] (fold in buttons),
        // decrease opacity of the rhs and increase for the lhs
        this.setLeftOpacity(this.originOpacities.left + distance)
        this.setRightOpacity(this.originOpacities.right - distance)
        this.updateOffset("", -1*100*distance)
      } else {
        // On [<---] (fold out buttons),
        // decrease opacity of the lhs and increase for the rhs
        this.setLeftOpacity(this.originOpacities.left - distance)
        this.setRightOpacity(this.originOpacities.right + distance)
        this.updateOffset("", 100*distance)

      }

      // The background color should have its opacity increased
      // regardless of the move() direction.
      this.setBgOpacity(distance/2)
    }
  }

  end(event: TouchEvent): HTMLSpanElement|null {
    if (!this.isMobile()) { return null; }
    const touch = event.changedTouches.item(0)
    if (touch) {
      const newX = touch.pageX/window.innerWidth
      const distance = Math.abs(newX - this.originX)

      // Return the current element being touched
      // if the swipe was over a short distance (i.e. essentially a click)
      if (distance <= CLICK_LIMIT) {
        this.restoreLayout()
        return event.target as HTMLSpanElement
      }

      // Restore the layout if the rhs has high transparency.
      if (this.getOpacities().right >= 0.5) {
        return null
      }

      this.restoreLayout()
    }

    return null
  }

  restoreLayout() {
    if (this.grid != null) {
      this.setBgOpacity(0.0)
      this.setLeftOpacity(1.0)
      this.setRightOpacity(0.0)
      this.updateOffset("inherit", 0)
    }
  }
}
