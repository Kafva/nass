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

export {GetHTMLElement, GetHTMLElements, fly, fade}
