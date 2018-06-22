import * as React from 'react';
//import { Tree, TreeNode, NodeFilter } from 'infinite-tree';
import { InfiniteTree as Tree, TreeNode, NodeFilter } from '../InfiniteTree';
import VirtualList from 'react-tiny-virtual-list';

const lcfirst = (str: string) => {
    str += '';
    return str.charAt(0).toLowerCase() + str.substr(1);
};

export interface RowHeightFunction<T> {
  (node: TreeNode, tree: Tree<T>, index: number): number
}

export interface RowRendererFunction<T> {
  (node: TreeNode, tree: Tree<T>, index: number): JSX.Element | string
}

export interface LoadDoneFunction<T> {
  (error: any, children: T[], completedCallback?: Function): void
}

export interface LoadNodesFunction<T> {
  (parentNode: TreeNode, done: LoadDoneFunction<T>): void
}

export interface ScrollListener {
  (scrollTop: number, event: React.UIEvent): void
}

export interface NodeListener<T> {
  (node: TreeNode & T): void
}

export interface Props<T> {
  className?: string

  style?: any

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
  rowHeight?: number | string | any[] |  RowHeightFunction<T>

  /** A row renderer for rendering a tree node. */
  rowRenderer?: RowRendererFunction<T>

  /** Loads nodes on demand. */
  loadNodes?: LoadNodesFunction<T>

  /** Provides a function to determine if a node can be selected or deselected. The function must return true or false. This function will not take effect if selectable is not true. */
  shouldSelectNode?: NodeFilter<T>

  shouldLoadNodes?: boolean

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
  onOpenNode?: NodeListener<T>

  /** Callback invoked when a node is closed. */
  onCloseNode?: NodeListener<T>

  /** Callback invoked when a node is selected or deselected. */
  onSelectNode?: NodeListener<T>

  /** Callback invoked before opening a node. */
  onWillOpenNode?: NodeListener<T>

  /** Callback invoked before closing a node. */
  onWillCloseNode?: NodeListener<T>

  /** Callback invoked before selecting or deselecting a node. */
  onWillSelectNode?: NodeListener<T>
}

export default class <T> extends React.Component<Props<T>, any> {
    static displayName = 'InfiniteTree';
    static defaultProps = {
        autoOpen: false,
        selectable: true,
        tabIndex: 0,
        data: [],
        width: '100%'
    };

    tree: Tree<T> | null = null;
    state = {
        nodes: []
    };

    virtualList: VirtualList | null = null;

    eventHandlers = {
        onContentWillUpdate: null,
        onContentDidUpdate: null,
        onOpenNode: null,
        onCloseNode: null,
        onSelectNode: null,
        onWillOpenNode: null,
        onWillCloseNode: null,
        onWillSelectNode: null
    };

    constructor(props: Props<T>) {
      super(props)
    }

    componentDidMount() {
        const { children, className, style, ...options } = this.props;

        options.rowRenderer = () => '';

        this.tree = new Tree<T>(/*options*/);

        // Filters nodes.
        // https://github.com/cheton/infinite-tree/wiki/Functions:-Tree#filterpredicate-options
        const treeFilter = this.tree.filter.bind(this.tree);
        this.tree.filter = (...args: any[]) => {
            setTimeout(() => {
              if (this.virtualList) {
                this.virtualList.recomputeSizes(0);
              }
            }, 0);
            return treeFilter(...args);
        };

        // Unfilter nodes.
        // https://github.com/cheton/infinite-tree/wiki/Functions:-Tree#unfilter
        const treeUnfilter = this.tree.unfilter.bind(this.tree);
        this.tree.unfilter = (...args: any[]) => {
            setTimeout(() => {
              if (this.virtualList) {
                this.virtualList.recomputeSizes(0);
              }
            }, 0);
            return treeUnfilter(...args);
        };

        // Sets the current scroll position to this node.
        // @param {Node} node The Node object.
        // @return {boolean} Returns true on success, false otherwise.
        this.tree.scrollToNode = (node) => {
            if (!this.tree || !this.virtualList) {
                return false;
            }

            const nodeIndex = this.tree.nodes.indexOf(node);
            if (nodeIndex < 0) {
                return false;
            }

            const offset = this.virtualList.getOffsetForIndex(nodeIndex);
            this.virtualList.scrollTo(offset);

            return true;
        };

        // Gets (or sets) the current vertical position of the scroll bar.
        // @param {number} [value] If the value is specified, indicates the new position to set the scroll bar to.
        // @return {number} Returns the vertical scroll position.
        this.tree.scrollTop = (value) => {
            if (!this.tree || !this.virtualList) {
                return;
            }

            if (value !== undefined) {
                this.virtualList.scrollTo(Number(value));
            }

            return this.virtualList.getNodeOffset();
        };

        // Updates the tree.
        this.tree.update = () => {
          if (this.tree) {
            this.tree.emit('contentWillUpdate');
            this.setState((_: any) =>  {
              return {
                  nodes: this.tree ? this.tree.nodes : []
              }
            }, () => {
              if (this.tree) {
                this.tree.emit('contentDidUpdate');
              }
            });
          }
        };

        Object.keys(this.eventHandlers).forEach(key => {
            if (!(this.props as any)[key]) {
                return;
            }

            const eventName = lcfirst(key.substr(2)); // e.g. onContentWillUpdate -> contentWillUpdate
            (this.eventHandlers as any)[key] = (this.props as any)[key];
            if (this.tree) {
              this.tree.on(eventName, (this.eventHandlers as any)[key] as Function);
            }
        });
    }
    componentWillUnmount() {
        Object.keys(this.eventHandlers).forEach(key => {
          if (this.tree) {
            if (!(this.eventHandlers as any)[key]) {
                return;
            }

            const eventName = lcfirst(key.substr(2)); // e.g. onUpdate -> update
            this.tree.removeListener(eventName, (this.eventHandlers as any)[key] as Function);
            (this.eventHandlers as any)[key] = null;
          }
        });

        if (this.tree) {
          this.tree.destroy();
        }
        this.tree = null;
    }
    render() {
        const {
            autoOpen,
            selectable,
            tabIndex,
            data,
            width,
            height,
            rowHeight,
            rowRenderer,
            shouldLoadNodes,
            loadNodes,
            shouldSelectNode,
            scrollOffset,
            scrollToIndex,
            onScroll,
            onContentWillUpdate,
            onContentDidUpdate,
            onOpenNode,
            onCloseNode,
            onSelectNode,
            onWillOpenNode,
            onWillCloseNode,
            onWillSelectNode,
            style,
            children,
            ...props
        } = this.props;

        const render = (typeof children === 'function')
            ? children
            : rowRenderer;

        const count = this.tree
            ? this.tree.nodes.length
            : 0;

        // VirtualList
        const virtualListProps: any = {};
        if ((scrollOffset !== undefined) && (count > 0)) {
            virtualListProps.scrollOffset = scrollOffset;
        }
        if ((scrollToIndex !== undefined) && (scrollToIndex >= 0) && (scrollToIndex < count)) {
            virtualListProps.scrollToIndex = scrollToIndex;
        }
        if (typeof onScroll === 'function') {
            virtualListProps.onScroll = onScroll;
        }

        return (
            <div
                {...props}
                style={{
                    outline: 'none',
                    ...style
                }}
                tabIndex={tabIndex}
            >
                <VirtualList
                    ref={node => {
                        this.virtualList = node;
                    }}
                    width={width || '100%'}
                    height={height || '100%'}
                    itemCount={count}
                    itemSize={(index): number => {
                      if (this.tree) {
                        const node = this.tree.nodes[index];
                        if (node && node.state.filtered === false) {
                            return 0;
                        }

                        if (typeof rowHeight === 'function') {
                            return rowHeight(
                                this.tree.nodes[index],
                                this.tree,
                                index
                            );
                        }
                      }
                      return rowHeight as number; // Number or Array
                    }}
                    renderItem={({ index, style }) => {
                        let row = null;

                        if (this.tree && typeof render === 'function') {
                            const node = this.tree.nodes[index];
                            if (node && node.state.filtered !== false) {
                                row = render(
                                    this.tree.nodes[index],
                                    this.tree,
                                    index
                                );
                            }
                        }

                        return (
                            <div key={index} style={style}>
                                {row}
                            </div>
                        );
                    }}
                    {...virtualListProps}
                />
            </div>
        );
    }
};
