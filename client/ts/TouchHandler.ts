import { IsMobile } from "./util";
import { visibleButtonsStore } from "./store";

/**
 * Max distance between the origin and end of a swipe for it
 * to be considered a click.
 */
const CLICK_LIMIT = 0.02

/** Maximum allowed distance to move from the origin */
const MAX_DISTANCE = 0.5


/**
 * The opacity required upon the rhs for it to remain open
 * after a swipe motion.
 */
const KEEP_OPEN_FROM_OPACITY = 0.5

// Percentage of the screen that a swipe is allowed to move
// in the Y direction will not losing focus. It is preferable
// for this to be low in regards to the UX of vertical scrolling.
const Y_FOCUS_THRESHOLD = 0.1

/** Lowest allowed value for text opacity */
const OPACITY_LOW_TIDE = 0.3;

const BG_OPACITY_MAX = 0.2;
const BG_COLOR = "25,25,24"

/**
  * Maximum font size of buttons on the rhs,
  * should be equal to `vars.$font_icon_high_mobile`.
  */
const MAX_FONT_SIZE = 28
const MIN_FONT_SIZE = 18
const MAGNIFIER_MULTIPLIER = 15


/** Handler for touch events on each item in the PasswordTree */
export default class TouchHandler {
  constructor(
    /**
     * Path to the `PassEntry` that this `TouchHandler` instance
     * is bound to.
     */
    private path: string,

    /** (x,y) coordinate origin of a new touch event. */
    private originPos = {x: 0, y: 0},

    /** Font size of the rhs buttons upon a new touch event in px. */
    private originFontSize = 0,

    /** Opacity values at the start of a  new touch event. */
    private originOpacities = {left: 0, right: 0, bg: 0},

    /** Left hand side of grid container */
    public lhs: HTMLSpanElement|null = null,

    /** Right hand side of grid container */
    public rhs: HTMLDivElement|null = null,

    /** Grid container, the last child is always the buttons container */
    public grid: HTMLDivElement|null = null
  ){}

  private getOpacities(): {left: number, right: number, bg: number} {
    const bg_splits = this.grid!.style.backgroundColor.split(',')
    const bg = bg_splits.length == 4 ?
      parseFloat(bg_splits[3].slice(0,-1)) : 0.0
    return {
      left: this.lhs != null ?
        parseFloat(window.getComputedStyle(this.lhs).opacity) : 0.0,
      right: this.rhs != null ?
        parseFloat(window.getComputedStyle(this.rhs).opacity) : 0.0,
      bg: bg
    }
  }

  /** Get the font size of the rhs in pixels. */
  private getFontSize(): number {
    if (this.rhs != null) {
      const font_split = window.getComputedStyle(this.rhs).fontSize.split('px')
      return font_split.length == 2 ?
        parseInt(font_split[0]) : 0
    }
    return 0
  }

  /**
   * Update the position and right offset (-100, 100 %) of all elements in the
   * grid of the main container.
   */
  private setOffset(position = "", right = 0) {
    if (this.lhs != null && this.rhs != null) {
      if (position != "") {
        this.lhs.style.position = position
        this.rhs.style.position = position
      }
      this.lhs.style.right = `${right}%`
      this.rhs.style.right = `${right}%`
    }
  }

  /** Set the font size of the rhs in pixels. */
  private setFontSize(size: number) {
    const bounded_size = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size))
    this.rhs!.style.fontSize = `${bounded_size}px`
  }

  private setBgOpacity(opacity: number) {
    this.grid!.style.backgroundColor =
      `rgba(${BG_COLOR},${Math.min(BG_OPACITY_MAX, opacity)})`
  }

  private setLeftOpacity(opacity: number) {
    const bounded_opacity = Math.min(1.0, Math.max(OPACITY_LOW_TIDE, opacity))
    this.lhs!.style.opacity = bounded_opacity.toString()
  }

  private setRightOpacity(opacity: number) {
     this.rhs!.style.opacity = opacity.toString()
  }

  start(event: TouchEvent) {
    if (!IsMobile()) { return; }
    const touch = event.touches.item(0)
    if (touch) {
      // Save origin position and opacity
      this.originPos.x = touch.pageX/window.innerWidth
      this.originPos.y = touch.pageY/window.innerHeight

      this.setLeftOpacity(OPACITY_LOW_TIDE)
      this.setRightOpacity(OPACITY_LOW_TIDE)

      this.originOpacities = this.getOpacities()
      this.originFontSize = this.getFontSize()
      this.setOffset("relative")
    }
  }

  move(event: TouchEvent) {
    if (!IsMobile()) { return; }
    const touch = event.touches.item(0)
    if (touch) {
      // 0.0: Far left
      // 1.0: Far right
      const newX = touch.pageX/window.innerWidth
      const distance = Math.min(MAX_DISTANCE,  Math.abs(newX - this.originPos.x))

      // Abort row operations if the movement is a vertical scroll
      const verticalScroll = Math.abs(touch.pageY/window.innerHeight - this.originPos.y)
      if (verticalScroll >= Y_FOCUS_THRESHOLD) {
        this.restoreLayout()
        return
      }

      if (newX > this.originPos.x) {
        // On [--->] (fold IN buttons),
        // decrease opacity of the rhs and increase for the lhs
        this.setLeftOpacity(this.originOpacities.left + distance)
        this.setRightOpacity(this.originOpacities.right - distance)
        this.setOffset("", -1*100*distance)
        // Decrease rhs font size
        this.setFontSize(this.originFontSize - MAGNIFIER_MULTIPLIER*distance)
      } else {
        // On [<---] (fold OUT buttons),
        // decrease opacity of the lhs and increase for the rhs
        this.setLeftOpacity(this.originOpacities.left - distance)
        this.setRightOpacity(this.originOpacities.right + distance)
        this.setOffset("", 100*distance)
        // Increase rhs font size
        this.setFontSize(this.originFontSize + MAGNIFIER_MULTIPLIER*distance)
      }

      // The background color should have its opacity increased
      // regardless of the move() direction.
      this.setBgOpacity(distance/2)
    }
  }

  end(event: TouchEvent): HTMLSpanElement|null {
    if (!IsMobile()) { return null; }
    const touch = event.changedTouches.item(0)
    if (touch) {
      const newX = touch.pageX/window.innerWidth
      const distance = Math.abs(newX - this.originPos.x)

      // Return the current element being touched
      // if the swipe was over a short distance (i.e. essentially a click)
      if (distance <= CLICK_LIMIT) {
        // !! Caller needs to reset `visibleButtonsStore` after this !!
        return event.target as HTMLSpanElement
      }

      // Restore the layout if the rhs is highly transparent.
      if (this.getOpacities().right >= KEEP_OPEN_FROM_OPACITY) {
        // Update the currently visible button, other PassEntry
        // objects will be notified of this and hide their buttons
        //
        // !! NOTE: we do this on end() rather than start() so that
        // we can deny "clicks" on buttons that occur at start() or
        // during move() !!
        //
        visibleButtonsStore.set(this.path)
      } else {
        this.restoreLayout()
      }
    }

    return null
  }


  /** This is triggered when `visibleButtonsStore` is set to a new value. */
  restoreLayout() {
    if (this.grid != null) {
      this.setBgOpacity(0.0)
      this.setLeftOpacity(1.0)
      this.setRightOpacity(0.0)
      this.setFontSize(MIN_FONT_SIZE)
      this.setOffset("inherit", 0)
    }
  }
}
