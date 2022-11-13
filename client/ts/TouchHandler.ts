import { CalculateColumnLayout, ColumnLayoutToString } from "./util";
import type { ColumnLayout } from "./types";
import { get } from "svelte/store";
import { visibleButtonsStore } from "./store";
import { DRAWER_MAX_SPACE } from "./config";

// Max distance between the origin and end of a swipe for it
// to be considered a click.
const CLICK_LIMIT = 0.02

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

      //this.drawer().style.opacity     = `${1.0 - x}`
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

        //this.drawer().style.opacity     = "1.0"
        const nameColumn = 1 - this.defaultLayout.icon - DRAWER_MAX_SPACE

        this.grid!.style.gridTemplateColumns = 
          `${this.defaultLayout.icon}fr ${nameColumn}fr ${DRAWER_MAX_SPACE}fr`

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
      this.drawer().style.opacity     = "0.0"
    }
  }
}
