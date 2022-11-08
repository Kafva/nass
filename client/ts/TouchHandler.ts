const SWIPE_MARGIN = 40

/** Handler for touch events on each item in the PasswordTree */
export default class TouchHandler {
  /** Regex based UA platform check */
  private is_mobile(): boolean {
    return navigator.userAgent.match(/iPhone|iPad|Android|webOS/i) != null
  }

  start(event: TouchEvent, deleteButton: HTMLSpanElement,
    showButton: HTMLSpanElement|null) {
    if (!this.is_mobile()) { return; }
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
    if (!this.is_mobile()) { return; }
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
    if (!this.is_mobile()) { return; }
    const touch = event.changedTouches.item(0)
    if (touch) {
      const x = touch.pageX/window.innerWidth
      if (x > 0.5) { // Hide the buttons if the swipe ends far to the right
        deleteButton.style.display     = "none"
        deleteButton.style.opacity     = "0.0"
        if (showButton) {
          showButton.style.display     = "none";
          showButton.style.opacity     = "0.0"
        }
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
      }
    }
  }
}
