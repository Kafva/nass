import { get } from "svelte/store";
import { visibleButtonsStore } from "./store";

const SWIPE_MARGIN = 40

// Closnes between the origin and end of a swipe for it
// to be considered a click.
const CLICK_LIMIT = 0.03

// TODO: Check if swipe went 'nowhere' if so register a click()
// We need to allow for swipe-backs.

/** Handler for touch events on each item in the PasswordTree */
export default class TouchHandler {
  constructor(
    /**
     * Path to the `PassEntry` that this `TouchHandler` instance
     * is bound to.
     */
    private path: string,
    /** x coordinate origin of a new touch event. */
    private startX = 0
  ){}

  /** Regex based UA platform check */
  isMobile(): boolean {
    return navigator.userAgent.match(/iPhone|iPad|Android|webOS/i) != null
  }

  start(event: TouchEvent, deleteButton: HTMLSpanElement,
    showButton: HTMLSpanElement|null) {
    if (!this.isMobile()) { return; }


    const touch = event.touches.item(0)
    if (touch) {
      this.startX = touch.pageX/window.innerWidth
      deleteButton.style.display     = "inline-block";
      deleteButton.style.opacity     = "0.0"

      if (showButton) {
        showButton.style.display     = "inline-block";
        showButton.style.marginLeft  = `${SWIPE_MARGIN}px`
        showButton.style.opacity     = "0.0"
      } else {
        deleteButton.style.marginLeft = `${SWIPE_MARGIN}px`
      }
    }
  }

  move(event: TouchEvent, deleteButton: HTMLSpanElement,
    showButton: HTMLSpanElement|null) {
    if (!this.isMobile()) { return; }
    const touch = event.touches.item(0)
    if (touch) {
      // 0.0: Far left
      // 1.0: Far right
      const x = touch.pageX/window.innerWidth

      // The margin starts from `SWIPE_MARGIN` on a new swipe
      // (far of to the right) and magnitude is decreased incrementally
      deleteButton.style.opacity     = `${1.0 - x}`

      if (showButton) {
        showButton.style.marginLeft  = `${SWIPE_MARGIN*x}px`
        showButton.style.opacity     = `${1.0 - x}`
      } else {
        deleteButton.style.marginLeft = `${SWIPE_MARGIN*x}px`
      }
    }
  }

  end(event: TouchEvent, deleteButton: HTMLSpanElement,
    showButton: HTMLSpanElement|null): HTMLSpanElement|null {
    if (!this.isMobile()) { return null; }
    const touch = event.changedTouches.item(0)
    if (touch) {
      const x = touch.pageX/window.innerWidth

      // Return the current element being touched
      // if the swipe was over a short distance (i.e. essentially a click)
      if (Math.abs(x - this.startX) <= CLICK_LIMIT) {
        return event.target as HTMLSpanElement
      }

      // If a swipe event is started on a new node, hide the buttons on the old
      // one regardless of if the buttons on the new node end up being
      // fully displayed.
      if (get(visibleButtonsStore) != this.path) {
        visibleButtonsStore.set("")
      }

      if (x > 0.5) { // Hide the buttons if the swipe ends far to the right
        this.hideButton(deleteButton)
        this.hideButton(showButton)
      } else { // Let them remain visible if the swipe ends to the left
        deleteButton.style.display     = "inline-block";
        deleteButton.style.opacity     = "1.0"
        if (showButton) {
          showButton.style.display     = "inline-block";
          showButton.style.marginLeft  = "0px"
          showButton.style.opacity     = "1.0"
        } else {
          deleteButton.style.marginLeft = "0px"
        }

        // Update the currently visible button, other PassEntry
        // objects will be notified of this and hide their buttons
        visibleButtonsStore.set(this.path)
      }
    }

    return null
  }

  hideButton(btn: HTMLSpanElement|null) {
    if (btn) {
      btn.style.display     = "none"
      btn.style.opacity     = "0.0"
    }
  }

}
