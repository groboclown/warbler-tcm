
declare module 'InfiniteTree' {
  import * as React from 'react'

  export class Tree {
/*
    addChildNodes(newNodes, [index], [parentNode])

Adds an array of new child nodes to a parent node at the specified index.
Arguments

    newNodes (Array): An array of new child nodes.
    [index] (number): The 0-based index of where to insert the child node.
    [parentNode] (Node): The Node object that defines the parent node.

Returns

(boolean): Returns true on success, false otherwise.
Example

appendChildNode(newNode, parentNode)

Adds a new child node to the end of the list of children of a specified parent node.

    If the parent is null or undefined, inserts the child at the specified index in the top-level.
    If the parent has children, the method adds the child as the last child.
    If the parent does not have children, the method adds the child to the parent.

Arguments

    newNode (Object): The new child node.
    parentNode (Node): The Node object that defines the parent node.

Returns

(boolean): Returns true on success, false otherwise.
Example

checkNode(node, [checked])

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
Example

tree.checkNode(node);// toggle checked and unchecked state
tree.checkNode(node, true); // checked=true, indeterminate=false
tree.checkNode(node, false); // checked=false, indeterminate=false

clear()

Clears the tree.
Example

closeNode(node, [options])

Closes a node to hide its children.
Arguments

    node (Node): The Node object.
    [options={}] (Object): The options object.
    [options.silent=false] (boolean): Sets true to prevent "closeNode" event from being triggered.

Returns

(boolean): Returns true on success, false otherwise.
Example

filter(predicate, [options])

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

flattenChildNodes(parentNode)

Flattens all child nodes of a parent node.
Arguments

    parentNode (Node): The Node object that defines the parent node.

Returns

(Array): Returns an array of Node objects containing all the child nodes of the parent node.
Example

flattenNode(node)

Flattens a node.
Arguments

    node (Node): The Node object.

Returns

(Array): Returns a flattened list of Node objects.
Example

getChildNodes(parentNode)

Gets a list of child nodes.
Arguments

    parentNode (Node): The Node object that defines the parent node. If null or undefined, returns a list of top level nodes.

Returns

(Array): Returns an array of Node objects containing all the child nodes of the parent node.
Example

getNodeById(id)

Gets a node by its unique id. This assumes that you have given the nodes in the data a unique id.
Arguments

    id (number|string): An unique node id. A null value will be returned if the id doesn't match.

Returns

(Node): Returns a Node object that matches the id, null otherwise.
Example

getNodeFromPoint(x, y)

Returns the node at the specified point. If the specified point is outside the visible bounds or either coordinate is negative, the result is null.
Arguments

    x (number): A horizontal position within the current viewport.
    y (number): A vertical position within the current viewport.

Returns

(Node): Returns a Node object under the given point.
Example

getOpenNodes()

Gets an array of open nodes.
Returns

(Array): Returns an array of Node objects containing open nodes.
Example

getRootNode()
Returns

(Node): Returns the root node, or null if empty.
Example

getSelectedIndex()
Returns

(number): Returns the index of the selected node, or -1 if not selected.
Example

getSelectedNode()
Returns

(Node): Returns the selected node, or null if not selected.
Example

insertNodeAfter(newNode, referenceNode)

Inserts the specified node after the reference node.
Arguments

    newNode (Object): The new sibling node.
    referenceNode (Node): The Node object that defines the reference node.

Returns

(boolean): Returns true on success, false otherwise.
Example

insertNodeBefore(newNode, referenceNode)

Inserts the specified node before the reference node.
Arguments

    newNode (Object): The new sibling node.
    referenceNode (Node): The Node object that defines the reference node.

Returns

(boolean): Returns true on success, false otherwise.
Example

loadData(data)

Loads data in the tree.
Arguments

    data (Object|Array): The data is an object or array of objects that defines the node.

Example

moveNodeTo(node, parentNode, [index])

Moves a node from its current position to the new position.
Arguments

    node (Node): The Node object.
    parentNode (Node): The Node object that defines the parent node.
    [index] (number): The 0-based index of where to insert the child node.

Returns

(boolean): Returns true on success, false otherwise.
Example

openNode(node, [options])

Opens a node to display its children.
Arguments

    node (Node): The Node object.
    [options={}] (Object): The options object.
    [options.silent=false] (boolean): Sets true to prevent "openNode" event from being triggered.

Returns

(boolean): Returns true on success, false otherwise.
Example

removeChildNodes(parentNode)

Removes all child nodes from a parent node.
Arguments

    parentNode (Node): The Node object that defines the parent node.

Returns

(boolean): Returns true on success, false otherwise.
Example

removeNode(node)

Removes a node and all of its child nodes.
Arguments

    node (Node): The Node object.

Returns

(boolean): Returns true on success, false otherwise.
Example

scrollToNode(node)

Sets the current scroll position to this node.
Arguments

    node (Node): The Node object.

Returns

(boolean): Returns true on success, false otherwise.
Example

scrollTop([value])
Arguments

    [value] (number): If the value is specified, indicates the new position to set the scroll bar to.

Returns

(number): Returns the vertical scroll position.
Example

selectNode(node, [options])

Selects a node.
Arguments

    node (Node): The Node object. If null or undefined, deselects the current node.
    [options={}] (Object): The options object.
    [options.autoScroll=true] (boolean): Sets true to automatically scroll to the selected node. Defaults to true.
    [options.silent=false] (boolean): Sets true to prevent "selectNode" event from being triggered. Defaults to false.

Returns

(boolean): Returns true on success, false otherwise.
Example

swapNodes(node1, node2)

Swaps two nodes.
Arguments

    node1 (Node): The Node object.
    node2 (Node): The Node object.

Returns

(boolean): Returns true on success, false otherwise.
Example

toggleNode(node, [options])

Toggles a node to display or hide its children.
Arguments

    node (Node): The Node object.
    [options={}] (Object): The options object.
    [options.silent=false] (boolean): Sets true to prevent "closeNode", "openNode", and "selectNode" events from being triggered.

Example

toString(node)

Serializes the current state of a node to a JSON string.
Arguments

    node (Node): The Node object. If null, returns the whole tree.

Returns

(string): Returns a JSON string represented the tree.
Example

unfilter()

Unfilter nodes.
Example

tree.unfilter();

update()

Updates the tree.
Example

updateNode(node, data, [options])

Updates the data of a node.
Arguments

    node (Node): The Node object.
    data (Object): The data object.
    [options={}] (Object): The options object.
    [options.shallowRendering=false] (boolean): Sets true to render only the node without expanded child nodes.

Example

*/
  }

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


    /*
    contains(node)

Returns a boolean value indicating whether a node is a descendant of a given node or not.
Arguments

    node (Object): Specifies the node that may be contained by (a descendant of) a specified node.

Returns

(boolean): Returns true if a node is a descendant of a specified node, otherwise false. A descendant can be a child, grandchild, great-grandchild, and so on.
Example

rootNode.contains(node);
// → true
node.contains(rootNode);
// → false

getChildAt(index)

Gets a child node at the specified index.
Arguments

    index (number): The index of the child node.

Returns

(Object): Returns a Node object of the specified child, null otherwise.
Example

node.getChildAt(-1);
// → null
node.getChildAt(0);
// → Node {}

getChildren()

Gets the child nodes.
Returns

(Array): Returns an array of Node objects containing the child nodes.
Example

node.getChildren();
// → [Node {}, Node {}]

getFirstChild()

Gets the first child node.
Returns

(Object): Returns a Node object of the first child, null otherwise.
Example

node.getFirstChild();
// → Node {}

getLastChild()

Gets the last child node.
Returns

(Object): Returns a Node object of the last child, null otherwise.
Example

node.getLastChild();
// → Node {}

getNextSibling()

Gets the next sibling node.
Returns

(Object): Returns a Node object of the next sibling, null otherwise.
Example

node.getNextSibling();
// → Node {}

getParent()

Gets the parent node.
Returns

(Object): Returns a Node object of the parent, null otherwise.
Example

node.getParent();
// → Node {}

getPreviousSibling()

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

isLastChild()

Checks whether this node is the last child of its parent.
Returns

(boolean): Returns true if the node is the last child of its parent, false otherwise.
Example

node.isLastChild();
// → true
*/
  }

  export interface RowHeightFunction {
    (node: TreeNode, tree: Tree, index: number): number
  }

  export interface RowRendererFunction {
    (node: TreeNode, tree: Tree, index: number): JSX.Element
  }

  export interface DoneFunction {
    (): void
  }

  export interface LoadNodesFunction {
    (parentNode: TreeNode, done: DoneFunction): void
  }

  export interface NodeFilter {
    (node: TreeNode): boolean
  }

  export interface ScrollListener {
    (scrollTop: number, event: React.UIEvent): void
  }

  export interface NodeListener {
    (node: TreeNode): void
  }

  export interface Props {
    /** Whether to open all nodes when tree is loaded. */
    autoOpen?: boolean

    /** Whether or not a node is selectable in the tree. */
    selectable?: boolean

    /** Specifies the tab order to make tree focusable. */
    tabIndex?: number

    /** Tree data structure, or a collection of tree data structures. */
    data?: any[] | any

    /** The tree width. It can be a number or string like "auto" or "100%". */
    width: number | string

    /** The tree height. Setting 100% height is currently not supported. See https://github.com/cheton/react-infinite-tree/issues/8. */
    height?: number | string

    /** Either a fixed height, an array containing the heights of all the rows, or a function that returns the height of the given node. */
    rowHeight?: number | any[] |  RowHeightFunction

    /** A row renderer for rendering a tree node. */
    rowRenderer?: RowRendererFunction

    /** Loads nodes on demand. */
    loadNodes?: LoadNodesFunction

    /** Provides a function to determine if a node can be selected or deselected. The function must return true or false. This function will not take effect if selectable is not true. */
    shouldSelectNode?: NodeFilter

    /** Controls the scroll offset. */
    scrollOffset?: number

    /** Node index to scroll to. */
    scrollToIndex?: number

    /** Callback invoked whenever the scroll offset changes. */
    onScroll?: ScrollListener

    /** Callback invoked before updating the tree. */
    onContentWillUpdate?: Function

    /** Callback invoked when the tree is updated. */
    onContentDidUpdate?: Function

    /** Callback invoked when a node is opened. */
    onOpenNode?: NodeListener

    /** Callback invoked when a node is closed. */
    onCloseNode?: NodeListener

    /** Callback invoked when a node is selected or deselected. */
    onSelectNode?: NodeListener

    /** Callback invoked before opening a node. */
    onWillOpenNode?: NodeListener

    /** Callback invoked before closing a node. */
    onWillCloseNode?: NodeListener

    /** Callback invoked before selecting or deselecting a node. */
    onWillSelectNode?: NodeListener
  }

  export default class InfiniteTree extends React.Component<Props, any> {
    constructor(props: Props);
  }
}
