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
   * Follow the given path of parents until the array is empty and either add 
   * or delete the given `entry`.
   */
  private followToLeaf(parents: string[], entry: PassEntry, remove: boolean): boolean {

    if (parents.length == 0) {
      const idx = this.subitems.findIndex(c => c.name == entry.name)
      if (remove) { // DELETE
        if (idx != -1) {
          delete this.subitems[idx]
          return true
        } else {
          Err(`The entry '${entry.name}' does not exist under '${this.path}'`)
        }
      } else { // ADD
        if (idx == -1) {
          this.subitems.push(entry)
          return true
        } else {
          Err(`The entry '${entry.name}' already exists under '${this.path}'`)
        }
      }

      return false
    }

    const results: boolean[] = []

    this.subitems.forEach( (subentry: PassEntry) => {
      if (subentry.name == parents[0]) {
        results.push(subentry.followToLeaf(parents.slice(1,-1), entry, remove))
      }
    })

    return results.some(r=>r)
  }

  /** Delete a leaf or directory in the given path */
  deleteChild(path: string): boolean {
    const nodes = path.split('/')
    const entry = new PassEntry(nodes[0], [], [], [])
    
    return this.followToLeaf(nodes.slice(0,-1), entry, true)
  }

  /** Add a leaf in the provided path */
  addChild(path: string) {
    const nodes = path.split('/')
    const entry = new PassEntry(nodes[0], [], [], [])
    
    return this.followToLeaf(nodes.slice(0,-1), entry, false) != null
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
