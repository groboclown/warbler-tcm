declare module 'flattree' {


// @param {object|array} nodes The tree nodes
// @param {object} [options] The options object
// @param {boolean} [options.openAllNodes] True to open all nodes. Defaults to false.
// @param {array} [options.openNodes] An array that contains the ids of open nodes
// @return {array}
  export function flatten(nodes?: Node | Node[], options?: {
    openAllNodes?: boolean,
    openNodes?: string[] | Node[]
  }): Node[]

  /**
   * The tree will take any object and add properties to make it a Node.
   */
  export class Node {
    id: string

    /** The depth of a node. */
    depth: number

    /** Whether the node is expanded. */
    open: boolean

    /** A unique path string representing a node. */
    path: string

    /** The prefix mask. */
    prefixMask: string

    /** The total number of child nodes. */
    total: number

    /** Private data */
    state: {
      filtered: boolean

      // Extras...
      total: number
      checked: boolean
      indeterminate: boolean
      depth: number
      open: boolean
      collapsing: boolean
      selected: boolean
    }

    parent: Node | null
    children: Node[] | null

    constructor(node: any)

    /**
    Returns a boolean value indicating whether a node is a descendant of a given node or not.
    Arguments

        node (Object): Specifies the node that may be contained by (a descendant of) a specified node.

    Returns

    (boolean): Returns true if a node is a descendant of a specified node, otherwise false. A descendant can be a child, grandchild, great-grandchild, and so on.

    Examples
      rootNode.contains(node);
      // → true
      node.contains(rootNode);
      // → false
    */
    contains(node: Node): boolean

    /**
    Gets a child node at the specified index.
    Arguments

        index (number): The index of the child node.

    Returns

    (Object): Returns a Node object of the specified child, null otherwise.

    Examples:
    node.getChildAt(-1);
    // → null
    node.getChildAt(0);
    // → Node {}
    */
    getChildAt(index: number): Node | null

    /**
    Gets the child nodes.
    Returns

    (Array): Returns an array of Node objects containing the child nodes.
    Example

    node.getChildren();
    // → [Node {}, Node {}]
    */
    getChildren(): Node[]

    hasChildren(): boolean

    /**
    Gets the first child node.
    Returns

    (Object): Returns a Node object of the first child, null otherwise.
    Example

    node.getFirstChild();
    // → Node {}
    */
    getFirstChild(): Node | null

    /**
    Gets the last child node.
    Returns

    (Object): Returns a Node object of the last child, null otherwise.
    Example

    node.getLastChild();
    // → Node {}
    */
    getLastChild(): Node | null

    /**
    Gets the next sibling node.
    Returns

    (Object): Returns a Node object of the next sibling, null otherwise.
    Example

    node.getNextSibling();
    // → Node {}
    */
    getNextSibling(): Node | null

    /**
    Gets the parent node.
    Returns

    (Object): Returns a Node object of the parent, null otherwise.
    Example

    node.getParent();
    // → Node {}
    */
    getParent(): Node | null

    /**
    Gets the previous sibling node.
    Returns

    (Object): Returns a Node object of the previous sibling, null otherwise.
    Example

    node.getPreviousSibling();
    // → Node {}

    hasChildren()

    Checks whether this node has children.
    Returns

    (boolean): Returns true if the node has children, false otherwise.
    Example

    node.hasChildren();
    // → true
    */
    getPreviousSibling(): Node | null

    /**
    Checks whether this node is the last child of its parent.
    Returns

    (boolean): Returns true if the node is the last child of its parent, false otherwise.
    Example

    node.isLastChild();
    // → true
    */
    isLastChild(): boolean
  }
}
