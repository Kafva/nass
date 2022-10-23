import type {PassEntry} from './types'

/**
 * Collect the elements under #tmpl into a tree of `PassEntry` objects
 * Expected HTML format:
 *  <div title="folder1">
 *    <div title="entry1"></div> 
 *    <div title="entry1"></div> 
 *    ...
 *    <div title="folder2">
 *      ...
 *    </div>
 *  </div>  
 *  <div title="folder2">
 *    ...
 *  </div>  
 * ...
 */  
const PassEntryFromDOM = (current: HTMLDivElement, entry: PassEntry): PassEntry  =>  {
  const subitems = current.querySelectorAll(":scope > div")

  subitems.forEach( (div: HTMLDivElement) => {
    // Leaf items have no children, folders have one or more <div/> children
    const subentry = {name: div.title, subitems: []} as PassEntry
    if (div.children.length == 0) {
      entry.subitems.push(subentry)
    } else {
      entry.subitems.push(PassEntryFromDOM(div, subentry))
    }
  })

  return entry
}

/** Generic getter for DOM elements */
function GetHTMLElement<Type extends Element>(selector:string): Type {
  const el = document.querySelector(selector) as Type;
  if (el == undefined) {
    throw `No element found matching ${selector}`
  }
  return el
}

/** Prune away branches in a `PassEntry` tree that do not contain 
 * a node that matches a `queryString`.
 */
const PrunePassEntryTree = (rootEntry: PassEntry, queryString: string): PassEntry => {
  // Create an array of flat paths
  // Remove the entries that do not match the query
  // Recreate the tree and render the DOM

  return rootEntry
}

export {PassEntryFromDOM, PrunePassEntryTree, GetHTMLElement}
