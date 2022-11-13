import { visibleButtonsStore } from "./store";

// Max distance between the origin and end of a swipe for it
// to be considered a click.
const CLICK_LIMIT = 0.02

const MAX_OFFSET = 90
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
  private drawer(): HTMLDivElement {
    return this.grid!.lastChild as HTMLDivElement
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

      //this.grid!.style.position = "relative";
      this.icon().style.position =  "relative"
      this.name().style.position =  "relative"
      this.drawer().style.position =  "relative"

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
      //
      // If startX is large, the swipe started far to the right
      const x = Math.max(0.0, touch.pageX/window.innerWidth) 

      // Decrease the opacity of the name and icon (up to a threshold)
      // while increasing the opacity of the interactive button(s).
      const opacity = [1.0 - Math.abs(x), Math.abs(x)]
      const low = Math.max(OPACITY_LOW_TIDE, Math.min(...opacity)).toString()
      const high = Math.max(OPACITY_LOW_TIDE, Math.max(...opacity))

      this.icon().style.opacity     = low
      this.name().style.opacity     = low
      this.setDrawerOpacity(high)

      this.grid!.style.backgroundColor = 
        `rgba(${BG_COLOR},${Math.min(BG_OPACITY_MAX, high)})`

      // A large x should result in a small value for the right offset
      //this.grid!.style.right = 
      //  `${Math.min(MAX_OFFSET, MAX_OFFSET*Math.abs(1-x))}px`

      // To have the bg color stay in place, we only move the
      // contents of the row
      const offset = `${Math.min(MAX_OFFSET, MAX_OFFSET*Math.abs(1-x))}px`
      this.icon().style.right = offset
      this.name().style.right = offset
      this.drawer().style.right = offset
        
    }
  }

  end(event: TouchEvent): HTMLSpanElement|null {
    if (!this.isMobile()) { return null; }
    const touch = event.changedTouches.item(0)
    if (touch) {
      const x = touch.pageX/window.innerWidth

      // Return the current element being touched
      // if the swipe was over a short distance (i.e. essentially a click)
      if (Math.abs(x - this.startX) <= CLICK_LIMIT) {
        return event.target as HTMLSpanElement
      }

      if (x > 0.5) { // Hide the buttons if the swipe ends far to the right
        this.restoreGrid()
      } else { // Let them remain visible if the swipe ends to the left
        this.icon().style.opacity     = OPACITY_LOW_TIDE.toString()
        this.name().style.opacity     = OPACITY_LOW_TIDE.toString()

        this.grid!.style.backgroundColor = `rgba(${BG_COLOR},${BG_OPACITY_MAX})`
        this.setDrawerOpacity(OPACITY_HIGH_TIDE)

        const offset = `${MAX_OFFSET}px`
        this.icon().style.right = offset
        this.name().style.right = offset
        this.drawer().style.right = offset
      }
    }

    return null
  }

  restoreGrid() {
    if (this.grid != null) {
      //this.grid!.style.position = "inherit";
      //this.grid.style.right = "0px"
      
      this.icon().style.position =  "inherit"
      this.name().style.position =  "inherit"
      this.drawer().style.position =  "inherit"

      this.icon().style.right =  "0px"
      this.name().style.right =  "0px"
      this.drawer().style.right =  "0px"


      this.icon().style.opacity     = OPACITY_HIGH_TIDE.toString()
      this.name().style.opacity     = OPACITY_HIGH_TIDE.toString()

      this.grid!.style.backgroundColor = `rgba(${BG_COLOR},0.0)`
      this.setDrawerOpacity(0.0)
    }
  }
}
