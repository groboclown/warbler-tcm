
declare module 'infinite-tree' {


  export interface EventOptions {
    /** Sets true to prevent events from being triggered. */
    silent?: boolean
  }

  export interface SelectOptions extends EventOptions {
    /** ets true to automatically scroll to the selected node. Defaults to true. */
    autoScroll: boolean
  }

  export interface FilterOptions {
    /** Case sensitive string comparison. Defaults to false. This option is only available for string comparison. */
    caseSensitive?: boolean

    /** Exact string matching. Defaults to false. This option is only available for string comparison. */
    exactMatch?: boolean

    /** Gets the value at path of Node object. Defaults to 'name'. This option is only available for string comparison. */
    filterPath?: string

    /** Whether to include ancestor nodes. Defaults to true. */
    includeAncestors?: boolean

    /** Whether to include descendant nodes. Defaults to true. */
    includeDescendants?: boolean
  }

  export interface UpdateOptions {
    /** Sets true to render only the node without expanded child nodes. */
    shallowRendering: boolean
  }

  export interface NodeFilter<T> {
    (node: TreeNode & T): boolean
  }

  export class Tree<T> {
    nodes: TreeNode[]

    constructor(/*args: any*/)

    emit(signalName: string): void

    destroy(): void

    removeListener(signalName: string, listener: Function): void

    on(signalName: string, listener: Function): void

    /**
    Adds an array of new child nodes to a parent node at the specified index.
    Arguments

        newNodes (Array): An array of new child nodes.
        [index] (number): The 0-based index of where to insert the child node.
        [parentNode] (Node): The Node object that defines the parent node.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    addChildNodes(newNodes: T[], index?: number | TreeNode, parentNode?: TreeNode): boolean

    /*
    Adds a new child node to the end of the list of children of a specified parent node.

        If the parent is null or undefined, inserts the child at the specified index in the top-level.
        If the parent has children, the method adds the child as the last child.
        If the parent does not have children, the method adds the child to the parent.

    Arguments

        newNode (Object): The new child node.
        parentNode (Node): The Node object that defines the parent node.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    appendChildNode(newNode: T, parentNode: TreeNode): boolean

    /**
    Checks or unchecks the node.
    Arguments

        node (Node): The Node object.
        [checked] (boolean): Whether to check or uncheck the node. If not specified, it will toggle between checked and unchecked state.

    Returns

    (boolean): Returns true on success, false otherwise.
    Node State
    state.checked 	state.indeterminate 	description
    false 	false 	The node and all of its children are unchecked.
    true 	false 	The node and all of its children are checked.
    true 	true 	The node will appear as indeterminate when the node is checked and some (but not all) of its children are checked.

    Examples:
    tree.checkNode(node);// toggle checked and unchecked state
    tree.checkNode(node, true); // checked=true, indeterminate=false
    tree.checkNode(node, false); // checked=false, indeterminate=false
    */
    checkNode(node: TreeNode, checked?: boolean): boolean

    /**
    Clears the tree.
    */
    clear(): void

    /**

    Closes a node to hide its children.
    Arguments

        node (Node): The Node object.
        [options={}] (Object): The options object.
        [options.silent=false] (boolean): Sets true to prevent "closeNode" event from being triggered.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    closeNode(node: TreeNode, options?: EventOptions): boolean

    /**
    Filters nodes. Use a string or a function to test each node of the tree. Otherwise, it will render nothing after filtering (e.g. tree.filter(), tree.filter(null), tree.flter(0), tree.filter({}), etc.).
    Arguments

        predicate (string|function): A keyword string, or a function to test each node of the tree. If the predicate is an empty string, all nodes will be filtered. If the predicate is a function, returns true to keep the node, false otherwise.
        [options={}] (Object): The options object.
        [options.caseSensitive=false] (boolean): Case sensitive string comparison. Defaults to false. This option is only available for string comparison.
        [options.exactMatch=false] (boolean): Exact string matching. Defaults to false. This option is only available for string comparison.
        [options.filterPath='name'] (string): Gets the value at path of Node object. Defaults to 'name'. This option is only available for string comparison.
        [options.includeAncestors=true] (boolean): Whether to include ancestor nodes. Defaults to true.
        [options.includeDescendants=true] (boolean): Whether to include descendant nodes. Defaults to true.

    Example #1: Filter by string

    const keyword = 'text-to-filter';
    const filterOptions = {
        caseSensitive: false,
        exactMatch: false,
        filterPath: 'props.name', // Defaults to 'name'
        includeAncestors: true,
        includeDescendants: true
    };
    tree.filter(keyword, filterOptions);

    Example #2: Filter by function

    const keyword = 'text-to-filter';
    const filterOptions = {
        includeAncestors: true,
        includeDescendants: true
    };
    tree.filter(function(node) {
        const name = node.name || '';
        return name.toLowerCase().indexOf(keyword) >= 0;
    });
    */
    filter(predicate: string | NodeFilter<T>, options?: FilterOptions): void

    /**

    Flattens all child nodes of a parent node.
    Arguments

        parentNode (Node): The Node object that defines the parent node.

    Returns

    (Array): Returns an array of Node objects containing all the child nodes of the parent node.
    */
    flattenChildNodes(parentNode: TreeNode): (TreeNode & T)[]

    /**
    Flattens a node.
    Arguments

        node (Node): The Node object.

    Returns

    (Array): Returns a flattened list of Node objects.
    */
    flattenNode(node: TreeNode): (TreeNode & T)[]

    /**
    Gets a list of child nodes.
    Arguments

        parentNode (Node): The Node object that defines the parent node. If null or undefined, returns a list of top level nodes.

    Returns

    (Array): Returns an array of Node objects containing all the child nodes of the parent node.
    */
    getChildNodes(parentNode?: TreeNode | null): (TreeNode & T)[]

    /**
    Gets a node by its unique id. This assumes that you have given the nodes in the data a unique id.
    Arguments

        id (number|string): An unique node id. A null value will be returned if the id doesn't match.

    Returns

    (Node): Returns a Node object that matches the id, null otherwise.
    */
    getNodeById(id: number | string): (TreeNode & T) | null

    /**
    Returns the node at the specified point. If the specified point is outside the visible bounds or either coordinate is negative, the result is null.
    Arguments

        x (number): A horizontal position within the current viewport.
        y (number): A vertical position within the current viewport.

    Returns

    (Node): Returns a Node object under the given point.
    */
    getNodeFromPoint(x: number, y: number): (TreeNode & T) | null

    /**
    Gets an array of open nodes.
    Returns

    (Array): Returns an array of Node objects containing open nodes.
    */
    getOpenNodes(): (TreeNode & T)[]

    /**
    Returns

    (Node): Returns the root node, or null if empty.
    */
    getRootNode(): (TreeNode & T) | null

    /**
    Returns

    (number): Returns the index of the selected node, or -1 if not selected.
    */
    getSelectedIndex(): number

    /**
    Returns

    (Node): Returns the selected node, or null if not selected.
    */
    getSelectedNode(): (TreeNode & T) | null

    /**
    Inserts the specified node after the reference node.
    Arguments

        newNode (Object): The new sibling node.
        referenceNode (Node): The Node object that defines the reference node.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    insertNodeAfter(newNode: any, referenceNode: TreeNode): boolean

    /**
    Inserts the specified node before the reference node.
    Arguments

        newNode (Object): The new sibling node.
        referenceNode (Node): The Node object that defines the reference node.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    insertNodeBefore(newNode: any, referenceNode: TreeNode): boolean

    /**
    Loads data in the tree.
    Arguments

        data (Object|Array): The data is an object or array of objects that defines the node.
    */
    loadData(data: any | any[]): void

    /**
    Moves a node from its current position to the new position.
    Arguments

        node (Node): The Node object.
        parentNode (Node): The Node object that defines the parent node.
        [index] (number): The 0-based index of where to insert the child node.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    moveNodeTo(node: TreeNode, parentNode: TreeNode, index?: number): boolean

    /**
    Opens a node to display its children.
    Arguments

        node (Node): The Node object.
        [options={}] (Object): The options object.
        [options.silent=false] (boolean): Sets true to prevent "openNode" event from being triggered.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    openNode(node: TreeNode, options?: EventOptions): boolean

    /**
    Removes all child nodes from a parent node.
    Arguments

        parentNode (Node): The Node object that defines the parent node.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    removeChildNodes(parentNode: TreeNode): boolean

    /**
    Removes a node and all of its child nodes.
    Arguments

        node (Node): The Node object.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    removeNode(node: TreeNode): boolean

    /**
    Sets the current scroll position to this node.
    Arguments

        node (Node): The Node object.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    scrollToNode(node: TreeNode): boolean
    /**
    Arguments

        [value] (number): If the value is specified, indicates the new position to set the scroll bar to.

    Returns

    (number): Returns the vertical scroll position.
    */
    scrollTop(value?: number): number

    /**
    Selects a node.
    Arguments

        node (Node): The Node object. If null or undefined, deselects the current node.
        [options={}] (Object): The options object.
        [options.autoScroll=true] (boolean): Sets true to automatically scroll to the selected node. Defaults to true.
        [options.silent=false] (boolean): Sets true to prevent "selectNode" event from being triggered. Defaults to false.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    selectNode(node: TreeNode, options?: SelectOptions): boolean

    /**
    Swaps two nodes.
    Arguments

        node1 (Node): The Node object.
        node2 (Node): The Node object.

    Returns

    (boolean): Returns true on success, false otherwise.
    */
    swapNodes(node1: TreeNode, node2: TreeNode): boolean

    /**
    Toggles a node to display or hide its children.
    Arguments

        node (Node): The Node object.
        [options={}] (Object): The options object.
        [options.silent=false] (boolean): Sets true to prevent "closeNode", "openNode", and "selectNode" events from being triggered.
    */
    toggleNode(node: TreeNode, options?: EventOptions): void

    /**
    Serializes the current state of a node to a JSON string.
    Arguments

        node (Node): The Node object. If null, returns the whole tree.

    Returns

    (string): Returns a JSON string represented the tree.
    */
    toString(node: TreeNode | null): string

    /**
    Unfilter nodes.
    */
    unfilter(): void

    /**
    Updates the tree.
    */
    update(): void

    /**
    Updates the data of a node.
    Arguments

        node (Node): The Node object.
        data (Object): The data object.
        [options={}] (Object): The options object.
        [options.shallowRendering=false] (boolean): Sets true to render only the node without expanded child nodes.
    */
    updateNode(node: TreeNode, data: any, options?: UpdateOptions): void
  }

  /**
   * The tree will take any object and add properties to make it a TreeNode.
   */
  export class TreeNode {
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
    }


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
    contains(node: TreeNode): boolean

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
    getChildAt(index: number): TreeNode | null

    /**
    Gets the child nodes.
    Returns

    (Array): Returns an array of Node objects containing the child nodes.
    Example

    node.getChildren();
    // → [Node {}, Node {}]
    */
    getChildren(): TreeNode[]

    /**
    Gets the first child node.
    Returns

    (Object): Returns a Node object of the first child, null otherwise.
    Example

    node.getFirstChild();
    // → Node {}
    */
    getFirstChild(): TreeNode | null

    /**
    Gets the last child node.
    Returns

    (Object): Returns a Node object of the last child, null otherwise.
    Example

    node.getLastChild();
    // → Node {}
    */
    getLastChild(): TreeNode | null

    /**
    Gets the next sibling node.
    Returns

    (Object): Returns a Node object of the next sibling, null otherwise.
    Example

    node.getNextSibling();
    // → Node {}
    */
    getNextSibling(): TreeNode | null

    /**
    Gets the parent node.
    Returns

    (Object): Returns a Node object of the parent, null otherwise.
    Example

    node.getParent();
    // → Node {}
    */
    getParent(): TreeNode | null

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
    getPreviousSibling(): TreeNode | null

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
