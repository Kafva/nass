import { CalculateColumnLayout, ColumnLayoutToString } from "./util";
import type { ColumnLayout } from "./types";
import { DRAWER_MAX_SPACE } from "./config";
import { get } from "svelte/store";
import { visibleButtonsStore } from "./store";

// Max distance between the origin and end of a swipe for it
// to be considered a click.
const CLICK_LIMIT = 0.02

const OPACITY_LOW_TIDE = 0.4;
const OPACITY_HIGH_TIDE = 1.0;
const BG_OPACITY_MAX = 0.4;

/** Handler for touch events on each item in the PasswordTree */
export default class TouchHandler {
  constructor(
    /**
     * Path to the `PassEntry` that this `TouchHandler` instance
     * is bound to.
     */
    private path: string,
    private treeLevel: number,

    /** Default layout of items in container grid */
    private defaultLayout: ColumnLayout,

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

  start(event: TouchEvent) {
    if (!this.isMobile()) { return; }

    const touch = event.touches.item(0)
    if (touch) {
      this.startX = touch.pageX/window.innerWidth
      this.drawer().style.opacity = "1.0"
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

      // The drawerColumn should: 
      //  * increase in width if we move  0.0 <-- 1.0  (startX - x > 0)
      //  * decrease in width if we move  0.0 --> 1.0  (startX - x < 0)
      const distance = this.startX - x 

      // Decrease the opacity of the name and icon (up to a threshold)
      // while increasing the opacity of the interactive buttons
      const opac = [1.0 - Math.abs(x), Math.abs(x)]
      const low = Math.max(OPACITY_LOW_TIDE, Math.min(...opac)).toString()
      const high = Math.max(OPACITY_LOW_TIDE, Math.max(...opac))

      this.icon().style.opacity     = low
      this.name().style.opacity     = low

      this.grid!.style.backgroundColor = `rgba(25,25,24,${Math.min(BG_OPACITY_MAX, high)})`
      this.drawer().style.opacity   = high.toString()

      const columnLayout = CalculateColumnLayout(this.treeLevel, distance)

      this.grid!.style.gridTemplateColumns = ColumnLayoutToString(columnLayout)
    }
  }

  end(event: TouchEvent): HTMLSpanElement|null {
    if (!this.isMobile()) { return null; }
    const touch = event.changedTouches.item(0)
    if (touch) {
      const x = touch.pageX/window.innerWidth

      // Return the current element being touched
      // if the swipe was over a short distance (i.e. essentially a click)
      console.log("click limit", Math.abs(x - this.startX), CLICK_LIMIT)
      if (Math.abs(x - this.startX) <= CLICK_LIMIT) {
        return event.target as HTMLSpanElement
      }

      // If a swipe event is started on a new node, hide the buttons on the old
      // one regardless of if the buttons on the new node end up being
      // fully displayed.
      if (get(visibleButtonsStore) != this.path) {
        visibleButtonsStore.set("")
      }

      if (x > 0.6) { // Hide the buttons if the swipe ends far to the right
        this.restoreGrid()
      } else { // Let them remain visible if the swipe ends to the left


        this.icon().style.opacity     = OPACITY_LOW_TIDE.toString()
        this.name().style.opacity     = OPACITY_LOW_TIDE.toString()

        this.grid!.style.backgroundColor = `rgba(25,25,24,${BG_OPACITY_MAX})`
        this.drawer().style.opacity   = OPACITY_HIGH_TIDE.toString()

        const nameColumn = 1 - this.defaultLayout.icon - DRAWER_MAX_SPACE

        this.grid!.style.gridTemplateColumns = ColumnLayoutToString({ 
          icon: this.defaultLayout.icon, 
          name: nameColumn, 
          drawer: DRAWER_MAX_SPACE
        })

        // Update the currently visible button, other PassEntry
        // objects will be notified of this and hide their buttons
        visibleButtonsStore.set(this.path)
      }
    }

    return null
  }

  restoreGrid() {
    if (this.grid != null) {
      this.grid.style.gridTemplateColumns = ColumnLayoutToString(this.defaultLayout)

      this.icon().style.opacity     = OPACITY_HIGH_TIDE.toString()
      this.name().style.opacity     = OPACITY_HIGH_TIDE.toString()

      this.grid!.style.backgroundColor = "rgba(25,25,24,0.0)"
      this.drawer().style.opacity      = "0.0"
    }
  }
}
