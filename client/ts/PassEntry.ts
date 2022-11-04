import { Err, GetHTMLElements } from './util'

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

  /** Returns true if there is case-insensitive match with the current `.name`,
   * within the `.subpaths` or `.parents` arrays.
   * NOTE: The `queryString` needs to be given in lowercase.
   * Returns true for empty queries and for the root node (which lacks a name)
   * */
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

  /**
   * Update the list of all complete paths beneath the current entry.
   * The root entry is skipped (searches do not need to know if they match
   * the root path) and will always have an empty `subpaths` attribute.
   */
  updateSubpaths(){
    this.subpaths = []
    this.subitems.forEach((entry: PassEntry) => {
      if (this.name != "") {
        this.subpaths = this.subpaths.concat(entry.flatten(this.name))
      }
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


  /**
   * Remove or add an entry matching the given path, returns
   * true on success.
   */
  updateTree(path: string, remove: boolean): boolean {
    const nodes = path.split('/')
    const leaf = nodes.pop()
    if (leaf) {
      const entry = new PassEntry(leaf, [], structuredClone(nodes), [])
      if (this.followToLeaf(nodes, entry, remove)) {
        this.updateSubpaths()
        return true
      }
    } else {
      Err("Empty path provided")
    }
    return false
  }

  /**
   * Follow the given path of `parents` until the array is empty and either add
   * or delete the given `entry`.
   */
  private followToLeaf(parents: string[], entry: PassEntry, remove: boolean): boolean {
    if (parents.length == 0) {
      const idx = this.subitems.findIndex(c => c.name == entry.name)
      if (remove) { // DELETE
        if (idx != -1) {
          this.subitems.splice(idx, 1)
          return true
        } else {
          Err(`The entry '${entry.name}' does not exist under '${this.path()}'`)
        }
      } else { // ADD
        if (idx == -1) {
          this.subitems.push(entry)
          return true
        } else {
          Err(`The entry '${entry.name}' already exists under '${this.path()}'`)
        }
      }

      return false
    }

    const results: boolean[] = []
    const nextParent = parents.splice(0,1)[0]

    this.subitems.forEach( (subentry: PassEntry) => {
      if (subentry.name == nextParent) {
        results.push(subentry.followToLeaf(parents, entry, remove))
      }
    })

    return results.some(r=>r)
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
