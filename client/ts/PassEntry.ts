
export default class PassEntry {
  constructor(
    public name: string,
    public subitems: PassEntry[]
  ){}

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
  loadFromDOM(current: HTMLDivElement): PassEntry {
    const divs = current.querySelectorAll(":scope > div")

    divs.forEach( (div: HTMLDivElement) => {
      // Leaf items have no children, folders have one or more <div/> children
      const subentry = new PassEntry(div.title, [])
      if (div.children.length == 0) {
        this.subitems.push(subentry)
      } else {
        this.subitems.push(subentry.loadFromDOM(div))
      }
    })

    return this
  }

  /** Prune away branches in a `PassEntry` tree that do not contain
   * a node that matches a `queryString`.
   */
  pruneToQuery(queryString: string): PassEntry {
    let x = this.flatten(this.name)
    console.log(queryString, x)
    // Remove the entries that do not match the query
    // Recreate the tree and render the DOM
    return this
  }

  /** Compile a flat array of all the paths in the tree */
  private flatten(currentPath: string): any[] {
    currentPath = currentPath == "" ? this.name : `${currentPath}/${this.name}`

    if (this.subitems.length == 0){
      return [currentPath]
    }

    let paths = []
    this.subitems.forEach( (subentry: PassEntry) => {
      paths.push(subentry.flatten(currentPath))
    })

    return paths.flat()
  }

}
