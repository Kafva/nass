import type {PassEntry} from '../ts/types'

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
const PassEntryFromDOM = (entry: PassEntry, current: HTMLDivElement): PassEntry  =>  {
  const subitems = current.querySelectorAll(":scope > div")

  subitems.forEach( (div: HTMLDivElement) => {
    // Leaf items have no children, folders have one or more <div/> children
    const subentry = {name: div.title, subitems: []} as PassEntry
    if (div.children.length == 0) {
      entry.subitems.push(subentry)
    } else {
      entry.subitems.push(PassEntryFromDOM(subentry, div))
    }
  })

  return entry
}

const PassEntryFlatten = (entry: PassEntry, currentPath: string): any[] => {
  // Walk downwards until a leaf is reached, saving the current path
  currentPath = currentPath == "" ? entry.name : `${currentPath}/${entry.name}`

  if (entry.subitems.length == 0){
    return [currentPath]
  }

  let flatPaths = []
  entry.subitems.forEach( (subentry: PassEntry) => {
    flatPaths.push( PassEntryFlatten(subentry, currentPath) )
  })

  return flatPaths.flat()
}

/** Prune away branches in a `PassEntry` tree that do not contain
 * a node that matches a `queryString`.
 */
const PassEntryPruneTree = (rootEntry: PassEntry, queryString: string): PassEntry => {
  let x = PassEntryFlatten(rootEntry, "") 
  console.log("x", x)


  // Remove the entries that do not match the query
  // Recreate the tree and render the DOM


  return rootEntry
}


export {PassEntryFromDOM, PassEntryPruneTree}

