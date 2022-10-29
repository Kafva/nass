/**
 * Custom fly transition to avoid a CSP hack with the current Svelte
 * implementation.
 * https://github.com/sveltejs/svelte/issues/6662
 */
const fly = function(node: HTMLElement, { vh = 30, delay = 0, duration = 1000 }) {
  // These parameters are defined for Svelte transitions (in-, out-, transition- etc.)
  return {
    delay,
    duration,
    // 't' goes from 0 to 1 for 'in-' animations and 1 to 0 for 'out-' animations.
    //
    // Using 'css' here gives better performance than 'tick' but requires a
    // nonce for an empty stylesheet to be provided as a CSP exception.
    tick: (t: number) => {
      // In- animation will start with opacity: 0 and translate(-0.0%)
      // This assumes that the dialog is off-screen by default.
      //
      // At the end of the 'in-' animation we will have translate(100%)
      // which moves the element DOWN.
      node.style.setProperty("transform", `translateY(${t * vh}vh)`)
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
