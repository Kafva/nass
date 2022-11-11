import { get } from "svelte/store";
import { visibleButtonsStore } from "./store";

// The #root container is centered using
//  margin-left: 50vw - $width/2
//
// The widths need to be adjusted based on if one or two buttons
// are going to be displayed
const SWIPE_MIN_WIDTH = 20
const SWIPE_MAX_WIDTH = 60

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
    /** x coordinate origin of a new touch event. */
    private startX = 0
  ){}

  /** Platform check based on viewport width and UA */
  isMobile(): boolean {
    return navigator.userAgent.match(/iPhone|iPad|Android/i) != null
           && document.body.clientWidth <= 480
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
        showButton.style.width  = `${SWIPE_MIN_WIDTH}px`
        showButton.style.opacity     = "0.0"
      }
      deleteButton.style.width = `${SWIPE_MIN_WIDTH}px`
    }
  }

  move(event: TouchEvent, deleteButton: HTMLSpanElement,
    showButton: HTMLSpanElement|null) {
    if (!this.isMobile()) { return; }
    const touch = event.touches.item(0)
    if (touch) {
      // 0.0: Far left
      // 1.0: Far right
      const x = Math.max(0.0, touch.pageX/window.innerWidth)

      deleteButton.style.opacity     = `${1.0 - x}`

      if (showButton) {
        showButton.style.width  = `${SWIPE_MAX_WIDTH*(1.0-x) + SWIPE_MIN_WIDTH}px`
        showButton.style.opacity     = `${1.0 - x}`
      }
      deleteButton.style.width = `${SWIPE_MAX_WIDTH*(1.0-x) + SWIPE_MIN_WIDTH}px`
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
      console.log(Math.abs(x - this.startX) , CLICK_LIMIT)
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
          showButton.style.width  = `${SWIPE_MAX_WIDTH + SWIPE_MIN_WIDTH}px`
          showButton.style.opacity     = "1.0"
        }
        deleteButton.style.width = `${SWIPE_MAX_WIDTH + SWIPE_MIN_WIDTH}px`

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
