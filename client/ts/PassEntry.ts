
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
   * a node that matches a `queryString`. Returns a new object without
   * changing the current instance.
   */
  pruneToQuery(queryString: string): PassEntry {
    // Extract a list of flat paths that match the query
    let flatPaths = this.flatten(this.name)
    const queryMatches = flatPaths // Case-insensitive matching
      .filter( (path:string) => path.toLowerCase()
                                    .includes(queryString.toLowerCase())
      )

    // Re-create the tree using the matched items
    queryMatches.sort()
    const nodeList = queryMatches.map( (path:string) => path.split('/') )
    const pruned = new PassEntry("", [])
    return pruned.loadFromNodeList(nodeList)
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

  /** Create a `PassEntry` tree from a list of nodes, each list
   * is a '/' seperated path that has been divided.
   * NOTE: the input needs to be alphabetically sorted
   * before bing split into lists!
   * This method is meant to be used on an empty tree.
   * */
  private loadFromNodeList(nodeList: string[][]): PassEntry {
    const handled_prefixes = []

    nodeList.forEach( (nodes: string[]) => {
      const currentPrefix = nodes[0]
      const subitem = new PassEntry(currentPrefix, [])
      if (nodes.length == 1) {
        this.subitems.push(subitem)
      } else if (!handled_prefixes.includes(currentPrefix)) {
        // Create a new node list with entries that match the current
        // prefix and strip away the prefix for the recursive call.
        const matchingPrefix = nodeList
          .filter( (list:string[]) => list[0] == currentPrefix )
          .map( (list:string[]) => list.slice(1) )

        handled_prefixes.push(currentPrefix)
        this.subitems.push( subitem.loadFromNodeList(matchingPrefix) )
      }
    })


    return this
  }
}
