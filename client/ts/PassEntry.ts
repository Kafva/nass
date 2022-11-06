import { Debug, Err, GetHTMLElements } from './util'

export default class PassEntry {
  constructor(
    public name: string,
    /**
     * To know if a subtree should be rendered
     * (based on the current `queryString`) we maintain a
     * list of the complete paths beneath each entry.
     */
    public subpaths: string[],
    /** Each child needs to be able to determine if one of
     * its ancestors match the current query.
     */
    public parents: string[],
    public subitems: PassEntry[]
  ){}

  /** Returns the path to the current item _without_ a leading slash */
  path(): string {
    const parent_path = this.parents.join('/')
    return parent_path == "" ?
      this.name :
      parent_path + "/" + this.name
  }

  /**
   * Returns true if `path` does not contain
   * an overlap with an existing leaf and does not conflict with
   * an existing directory.
   * E.g. if we have: /a/b/c
   *
   * /a/b     <-- INVALID
   * /a/b/c/d <-- INVALID
   * /a/b/e   <-- VALID
   */
  pathHasOverlap(newPath: string): boolean {
    const nodes = newPath.split('/')

    for (let i = 1; i <= nodes.length; i++) {
      // Check that each partial subpath of the provided path is not a leaf
      if (this.subpaths.some((subpath: string) =>
                              subpath == nodes.slice(0,i).join('/'))) {
        return true
      }
    }

    return false
  }

  /** Returns true if there is case-insensitive match with the current `.name`,
   * within the `.subpaths` or `.parents` arrays.
   * NOTE: The `queryString` needs to be given in lowercase.
   * Returns true for empty queries and for the root node (which lacks a name)
   */
  matchesQuery(queryString: string): boolean {
    return queryString == "" || this.name == "" ||
      this.name.toLowerCase().includes(queryString) ||
      this.subpaths.some( (subpath: string) =>
        subpath.toLowerCase().includes(queryString)
      ) ||
      this.parents.some( (node: string) =>
        node.toLowerCase().includes(queryString)
      )
  }

  /** Update the list of all complete paths beneath the current entry. */
  updateSubpaths(){
    this.subpaths = []
    this.subitems.forEach((entry: PassEntry) => {
      this.subpaths = this.subpaths.concat(entry.flatten(this.name))
      if (entry.subitems.length > 0) {
        entry.updateSubpaths()
      }
    })
  }


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
   * This sets the `.parents` attribute for each node.
   */
  loadFromDOM(current: HTMLDivElement, parents: string[]): PassEntry {
    const divs = GetHTMLElements<HTMLDivElement>(":scope > div", current)

    divs.forEach( (div: HTMLDivElement) => {
      // Leaf items have no children, folders have one or more <div/> children
      const subentry = new PassEntry(div.title, [], parents, [])
      if (div.children.length == 0) {
        this.subitems.push(subentry)
      } else {
        this.subitems.push(
          subentry.loadFromDOM(div, parents.concat(subentry.name))
        )
      }
    })

    return this
  }

  /** Load a tree from a JSON dict, this is useful for tests */
  loadFromJSON(current: { [id:string]: any }): PassEntry {
    current["subitems"].forEach( (s:any) => {
      let subentry = new PassEntry(s["name"],  s["subpaths"], s["parents"], [])
      subentry = subentry.loadFromJSON(s)

      this.subitems.push(subentry)
    })
    return this
  }


  /**
   * Remove or add an entry matching the given path
   * Since Svelte's update are assignment based,
   * a copy of the updated tree is returned.
   */
  updateTree(path: string, remove: boolean): PassEntry {
    const nodes = path.split('/')
    const leaf = nodes.pop()
    if (leaf) {
      // The nodes will be popped out incrementally so a deep copy
      // is needed for the parents of the `entry`.
      const entry = new PassEntry(leaf, [], structuredClone(nodes), [])
      this.followToLeaf(nodes, entry, remove)
      this.updateSubpaths()
    } else {
      Err("Empty path provided")
    }
    return this
  }

  /**
   * Follow the given path of `parents` until the array is empty, removing entries starting
   * from the left and either add or delete the given `entry`.
   * @note: for add operations new nodes leading up to the leaf will be created.
   */
  private followToLeaf(parents: string[],  entry: PassEntry, remove: boolean) {
    if (parents.length == 0) {
      const idx = this.subitems.findIndex(c => c.name == entry.name)
      if (remove) { // DELETE
        if (idx != -1) {
          Debug(`Deleting '${entry.name}' from '${this.path()}'`)
          this.subitems.splice(idx, 1)
        } else {
          Err(`The entry '${entry.name}' does not exist under '${this.path()}'`)
        }
      } else { // ADD
        if (idx == -1) {
          Debug(`Adding '${entry.name}' to '${this.path()}'`)
          this.subitems.push(entry)
        } else {
          Err(`The entry '${entry.name}' already exists under '${this.path()}'`)
        }
      }
      return // Basecase
    }

    const nextNode = parents.splice(0,1)[0]
    let matchFound = false

    this.subitems.forEach( (subentry: PassEntry) => {
      if (subentry.name == nextNode ) {
        subentry.followToLeaf(parents, entry, remove)
        matchFound = true
      }
    })

    // Add the node's parent path if it did not already exist and recurse on.
    if (!matchFound) {
      const subentry = new PassEntry(nextNode, [], [], [])
      subentry.followToLeaf(parents, entry, remove)
      this.subitems.push(subentry)
    }
  }

  /** Compile a flat array of all the paths in the tree */
  private flatten(currentPath: string): string[] {
    currentPath = currentPath == "" ? this.name : `${currentPath}/${this.name}`

    if (this.subitems.length == 0){
      return [currentPath]
    }

    const paths: string[][] = []
    this.subitems.forEach( (subentry: PassEntry) => {
      paths.push(subentry.flatten(currentPath))
    })

    return paths.flat()
  }
}
