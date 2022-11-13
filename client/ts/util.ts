import { Config, DRAWER_MAX_SPACE, MessageText } from "./config"
import type { ColumnLayout } from "./types"
import { msgTextStore } from "./store"

const ICON_MIN_SPACE = 0.1
const ICON_MAX_SPACE = 0.4

const DRAWER_MIN_SPACE = 0.1

const ColumnLayoutToString = (layout: ColumnLayout): string => {
  return `${layout.icon}fr ${layout.name}fr ${layout.drawer}fr`
}

// @param treeLevel root nodes are at a level 1
const CalculateColumnLayout = (treeLevel: number, touchDistance: number): ColumnLayout => {
  // Each row is in a grid:
  // -----------------------------------------------
  // | <span icon/> | <span name/> | <div drawer/> |
  // -----------------------------------------------
  // Instead of adjusting the left margin of the icon span we will
  // adjust the `grid-template-columns` layout for each tree level and
  // touches on the drawer.
  //
  // Increase the space occupied by the icon column as 
  // we go deeper.
  // --------------------------------------------------------------------------- 
  // |  [ICON_MIN,ICON_MAX] |  remaining space |   [DRAWER_MIN,DRAWER_MAX]     |
  // --------------------------------------------------------------------------- 

  // Adjust the icon space based on the treeLevel
  const iconColumn = Math.max(ICON_MIN_SPACE, 
    (treeLevel / Config.maxPassDepth) * ICON_MAX_SPACE)

  // The space occupied by the drawer column should increase based on the
  // distance of the current touch event (if any)
  //
  // 0.0: Far left
  // 1.0: Far right
  //
  // The drawerColumn should: 
  //  * increase in width if we move  0.0 <-- 1.0  (startX - x > 0)
  //  * decrease in width if we move  0.0 --> 1.0  (startX - x < 0)
  //
  let drawerColumn = DRAWER_MIN_SPACE // Default fallback

  if (touchDistance < 1 && touchDistance != 0) {
    // The touchDistance value is thus interpreted as:
    drawerColumn = touchDistance < 0 ? 
      //  negative: decrease the drawer space
      Math.max(DRAWER_MIN_SPACE, DRAWER_MAX_SPACE * (1-Math.abs(touchDistance))) :
      //  positive: increase the drawer space
      Math.min(DRAWER_MAX_SPACE, DRAWER_MIN_SPACE * (1+touchDistance))
  }
  

  // Remaining space
  const nameColumn = 1 - iconColumn - drawerColumn

  console.log("touch distance", touchDistance)
  console.log("template columns", iconColumn, nameColumn, drawerColumn)

  return {icon: iconColumn, name: nameColumn, drawer: drawerColumn} as ColumnLayout 
}

/**
 * Custom fly transition to avoid a CSP hack with the current Svelte
 * implementation.
 * https://github.com/sveltejs/svelte/issues/6662
 * This method expects the element in question to be off-screen by default.
 */
const fly = function(node: HTMLElement, {
  from = 'top', vh = 30, delay = 0, duration = 1000
}) {
  return {
    delay,
    duration,
    // Using 'css' here gives better performance than 'tick' but requires a
    // nonce for an empty stylesheet to be provided as a CSP exception.
    tick: (t: number) => {
      // 't' goes from 0 to 1 for 'in-' and 1 to 0 for 'out-' animations.
      //
      // In- animation will start with translate(0.0%) and move towards either
      //   100% (downwards): element should start above the top of the viewport
      //  -100% (downwards): element should start below the bottom of the viewport
      //
      node.style.setProperty("transform", `translateY(${from == 'top' ? '' : '-'}${t * vh}vh)`)
      node.style.setProperty("opacity", `${t}`)
    }
  }
}

/** Fade an element in/out up to the provided opacity limit. */
const fade = function(node: HTMLElement, { limit = 0.5, delay = 0, duration = 1000 }) {
  return {
    delay,
    duration,
    tick: (t: number) => {
      node.style.setProperty("opacity", `${t*limit}`)
    }
  }
}


/** Generic getter for DOM elements */
const GetHTMLElement = function<Type extends Element>(selector:string): Type {
  const el = document.querySelector(selector) as Type;
  if (el == undefined) {
    throw `No element found matching ${selector}`
  }
  return el
}

/** Generic getter for multiple DOM elements */
const GetHTMLElements = function<Type extends Element>(selector:string, root: Element):
 NodeListOf<Type> {
  const el = root.querySelectorAll(selector) as NodeListOf<Type>;
  if (el == undefined) {
    throw `No elements found matching ${selector}`
  }
  return el
}

/** Overwrite the clipbaord and create a message alert */
const CopyToClipboard = async (value: string) => {
  if (!Object.keys(navigator).includes('clipboard')) {
    msgTextStore.set([MessageText.err, "Clipboard is inaccessible"])
    Err(
      "Clipboard is inaccessible, the site origin needs to be over https:// or localhost"
    )
  } else {
    await navigator.clipboard.writeText(value)
    msgTextStore.set([MessageText.clipboard, ""])
  }
}

const Debug = (...args: any) => {
  if (Config.debugLogs) {
    console.log("%c DEBUG ", 'background: #2b71e0; color: #f5e4f3', ...args)
  }
}
const Err = (...args: any) => {
  console.log("%c ERROR ", 'background: #ed493e; color: #f5e4f3', ...args)
}

export { fly, fade, CalculateColumnLayout, ColumnLayoutToString, 
  GetHTMLElement, GetHTMLElements, CopyToClipboard, Debug, Err }
