import { visibleButtonsStore } from "./store";

// Max distance between the origin and end of a swipe for it
// to be considered a click.
const CLICK_LIMIT = 0.02

const MAX_OFFSET = 0.2
const OPACITY_LOW_TIDE = 0.4;
const OPACITY_HIGH_TIDE = 1.0;
const BG_OPACITY_MAX = 0.4;
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
    private startX = 0,

    /** Grid container, the last child is always the drawer element */
    public grid: HTMLDivElement|null = null
  ){}

  /** Platform check based on viewport width and UA */
  isMobile(): boolean {
    return navigator.userAgent.match(/iPhone|iPad|Android/i) != null
           && document.body.clientWidth <= 480
  }

  private icon(): HTMLSpanElement {
    return this.grid!.firstChild as HTMLSpanElement
  }
  private name(): HTMLSpanElement {
    return this.grid!.children.item(1) as HTMLSpanElement
  }
  /**
   * Update the position and right offset (0-100 %) of all elements in the
   * grid of the main container.
   */
  private updateElements(position = "", right = 0) {
    if (this.grid != null) {
      for (const child  of this.grid.children) {
        const htmlChild = child as HTMLElement
        if (position != "") {
          htmlChild.style.position = position
        }
        htmlChild.style.right = `${right}%`
      }
    }
  }

  private setDrawerOpacity(opacity: number) {
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
      this.startX = touch.pageX/window.innerWidth
      this.updateElements("relative")

      // Update the currently visible button, other PassEntry
      // objects will be notified of this and hide their buttons
      visibleButtonsStore.set(this.path)
    }
  }

  /**
   * Returns the distance from `startX` of the current touch
   * 0.0: Far left
   * 1.0: Far right
   *
   * A negative value indicates that startX > currentX, i.e. [<---]
   * A positive value indicates that startX < currentX, i.e. [--->]
   */
  private distanceX(touch: Touch): number {
    return touch.pageX/window.innerWidth - this.startX
  }

  move(event: TouchEvent) {
    if (!this.isMobile()) { return; }
    const touch = event.touches.item(0)
    if (touch) {
      //
      // The intensity of the effect is based on the distance between the
      // start and endpoint, not the actual position
      //
      const x = this.distanceX(touch)

      // [<---] If x < 0, we should INCREASE the right offset
      //  We want the offset to be MAX_OFFSET when x=-0.7
      // [--->] If x > 0, we should DECREASE the right offset
      //  We want the offset to be MIN_OFFSET when x=0.7
      //const offset = x < 0 ?
      //  Math.min(MAX_OFFSET, Math.abs(x)) :
      //  Math.min(MAX_OFFSET, 1-Math.abs(x))
      //Math.max(0, Math.max(MAX_OFFSET, x))

      const leftwards_swipe_offset = Math.min(MAX_OFFSET, Math.abs(x)) 

      // The new X should be greater than the startX
      const rightwards_swipe_offset = -1*( this.startX + (touch.pageX/window.innerWidth) )

      const offset = x < 0 ? leftwards_swipe_offset : rightwards_swipe_offset

      console.log("x", x)
      console.log("offset:", offset)

      // Decrease the opacity of the name and icon (up to a threshold)
      // while increasing the opacity of the interactive button(s).
      const opacity = [Math.abs(1.0 - x), Math.abs(x)]
      const low = Math.max(OPACITY_LOW_TIDE, Math.min(...opacity)).toString()
      const high = Math.max(OPACITY_LOW_TIDE, Math.max(...opacity))

      this.icon().style.opacity = low
      this.name().style.opacity = low
      this.setDrawerOpacity(high)

      this.grid!.style.backgroundColor =
        `rgba(${BG_COLOR},${Math.min(BG_OPACITY_MAX, high)})`

      // A large x should result in a small value for the right offset
      // To have the bg color stay in place, we only move the
      // contents of the row
      //const offset = Math.min(MAX_OFFSET, MAX_OFFSET*(1-Math.abs(x)))
      this.updateElements("", 100*offset)
    }
  }

  end(event: TouchEvent): HTMLSpanElement|null {
    if (!this.isMobile()) { return null; }
    const touch = event.changedTouches.item(0)
    if (touch) {
      const x = Math.abs(this.distanceX(touch))
      // Return the current element being touched
      // if the swipe was over a short distance (i.e. essentially a click)
      if (x <= CLICK_LIMIT) {
        return event.target as HTMLSpanElement
      }

      if (x > 0.5) { // Hide the buttons if the swipe ends far to the right
        this.restoreLayout()
      } else { // Let them remain visible if the swipe ends to the left
        this.icon().style.opacity     = OPACITY_LOW_TIDE.toString()
        this.name().style.opacity     = OPACITY_LOW_TIDE.toString()

        this.grid!.style.backgroundColor = `rgba(${BG_COLOR},${BG_OPACITY_MAX})`
        this.setDrawerOpacity(OPACITY_HIGH_TIDE)

        this.updateElements("", 100*MAX_OFFSET)
      }
    }

    return null
  }

  restoreLayout() {
    if (this.grid != null) {
      this.updateElements("inherit", 0)

      this.icon().style.opacity     = OPACITY_HIGH_TIDE.toString()
      this.name().style.opacity     = OPACITY_HIGH_TIDE.toString()

      this.grid!.style.backgroundColor = `rgba(${BG_COLOR},0.0)`
      this.setDrawerOpacity(0.0)
    }
  }
}
