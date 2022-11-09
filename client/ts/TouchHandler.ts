import { get } from "svelte/store";
import { visibleButtonsStore } from "./store";

const SWIPE_MARGIN = 40

// TODO: Check if swipe went 'nowhere' if so register a click()
// We need to allow for swipe-backs.

/** Handler for touch events on each item in the PasswordTree */
export default class TouchHandler {
  constructor(
    /**
     * Path to the `PassEntry` that this `TouchHandler` instance
     * is bound to.
     */
    private path: string
  ){}

  /** Regex based UA platform check */
  private isMobile(): boolean {
    return navigator.userAgent.match(/iPhone|iPad|Android|webOS/i) != null
  }

  private shouldHandleSwipe(): boolean {
    // To actually allow for clicks on the buttons to register we must ignore new touch
    // events when the buttons are visible. The user will haft to drag out the buttons
    // for another entry to close those on the current entry.
    return this.isMobile() && get(visibleButtonsStore) != this.path
  }


  start(event: TouchEvent, deleteButton: HTMLSpanElement,
    showButton: HTMLSpanElement|null) {
    if (!this.shouldHandleSwipe()) { return; }

    // If a swipe event is started on a new node, hide the buttons on the old
    // one regardless of if the buttons on the new node end up being
    // fully displayed.
    visibleButtonsStore.set("")

    const touch = event.touches.item(0)
    if (touch) {
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
    if (!this.shouldHandleSwipe()) { return; }
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
    showButton: HTMLSpanElement|null) {
    if (!this.shouldHandleSwipe()) { return; }
    const touch = event.changedTouches.item(0)
    if (touch) {
      const x = touch.pageX/window.innerWidth
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
  }

  hideButton(btn: HTMLSpanElement|null) {
    if (btn) {
      btn.style.display     = "none"
      btn.style.opacity     = "0.0"
    }
  }

}
