import { EventEmitter } from 'events';
import ensureArray from './ensure-array';
import { getIEVersion } from './browser';
import {
    getElementStyle,
    addEventListener,
    removeEventListener
} from './dom';

const ie = getIEVersion();

interface Options {
  rowsInBlock: number,
  blocksInCluster: number,
  tag: string | null,
  emptyClass: string,
  emptyText: string,
  keepParity: boolean
}

class Clusterize extends EventEmitter {
    options: Options = {
        rowsInBlock: 50,
        blocksInCluster: 4,
        tag: null,
        emptyClass: '',
        emptyText: '',
        keepParity: true
    };

    state = {
        lastClusterIndex: -1,
        itemHeight: 0,
        blockHeight: 0,
        clusterHeight: 0
    };

    scrollElement: HTMLElement | null = null;
    contentElement: HTMLElement | null = null;
    rows: any[] = [];
    cache: any = {};

    scrollEventListener = (() => {
        let debounce: NodeJS.Timer | null = null;

        return () => {
            const isMac = navigator.platform.toLowerCase().indexOf('mac') >= 0;
            if (isMac) {
                if (this.contentElement && this.contentElement.style.pointerEvents !== 'none') {
                    this.contentElement.style.pointerEvents = 'none';
                }

                if (debounce) {
                    clearTimeout(debounce);
                    debounce = null;
                }

                debounce = setTimeout(() => {
                    debounce = null;
                    if (this.contentElement) {
                      this.contentElement.style.pointerEvents = 'auto';
                    }
                }, 50);
            }

            const clusterIndex = this.getCurrentClusterIndex();
            if (this.state.lastClusterIndex !== clusterIndex) {
                this.changeDOM();
            }
            this.state.lastClusterIndex = clusterIndex;
        };
    })();

    resizeEventListener = (() => {
        let debounce: NodeJS.Timer | null = null;

        return () => {
            if (debounce) {
                clearTimeout(debounce);
                debounce = null;
            }
            debounce = setTimeout(() => {
                const prevItemHeight = this.state.itemHeight;
                const current = this.computeHeight();

                if ((current.itemHeight > 0) && (prevItemHeight !== current.itemHeight)) {
                    this.state = { ...this.state, ...current };
                    this.update(this.rows);
                }
            }, 100);
        };
    })();

    constructor(options: any) {
        super();

        if (!(this instanceof Clusterize)) {
            return new Clusterize(options);
        }

        this.options = Object.keys(this.options).reduce((acc: any, key: string) => {
            if (options[key] !== undefined) {
                acc[key] = options[key];
            } else {
                acc[key] = (this.options as any)[key];
            }
            return acc;
        }, {}) as Options;

        this.scrollElement = options.scrollElement;
        this.contentElement = options.contentElement;

        // Keep focus on the scrolling content
        if (this.contentElement && !this.contentElement.hasAttribute('tabindex')) {
            this.contentElement.setAttribute('tabindex', '0');
        }

        if (Array.isArray(options.rows)) {
            this.rows = options.rows;
        } else {
            this.rows = [];

            const nodes = this.contentElement && this.contentElement.children || [];
            const length = nodes.length;
            for (let i = 0; i < length; ++i) {
                const node = nodes[i];
                this.rows.push(node.outerHTML || '');
            }
        }

        // Remember scroll position
        let scrollTop: any = null
        if (this.scrollElement) {
          scrollTop = this.scrollElement.scrollTop;
        }

        this.changeDOM();

        // Restore scroll position
        if (this.scrollElement) {
          this.scrollElement.scrollTop = scrollTop;
          addEventListener(this.scrollElement, 'scroll', this.scrollEventListener);
        }
        addEventListener((window as any) as Element, 'resize', this.resizeEventListener);
    }
    destroy(clean?: boolean) {
        if (this.scrollElement) {
          removeEventListener(this.scrollElement, 'scroll', this.scrollEventListener);
        }
        removeEventListener((window as any) as Element, 'resize', this.resizeEventListener);

        const rows = clean ? this.generateEmptyRow() : this.rows;
        this.setContent(rows.join(''));
    }
    update(rows?: any[]) {
        this.rows = ensureArray(rows);

        // Remember scroll position
        let scrollTop: number = 0
        if (this.scrollElement) {
          scrollTop = this.scrollElement.scrollTop;
        }

        if ((this.rows.length * this.state.itemHeight) < scrollTop) {
            if (this.scrollElement) {
              this.scrollElement.scrollTop = 0;
            }
            this.state.lastClusterIndex = 0;
        }
        this.changeDOM();

        // Restore scroll position
        if (this.scrollElement) {
          this.scrollElement.scrollTop = scrollTop;
        }
    }
    clear() {
        this.rows = [];
        this.update();
    }
    append(rows: any[]) {
        rows = ensureArray(rows);
        if (!rows.length) {
            return;
        }
        this.rows = this.rows.concat(rows);
        this.changeDOM();
    }
    prepend(rows: any[]) {
        rows = ensureArray(rows);
        if (!rows.length) {
            return;
        }
        this.rows = rows.concat(this.rows);
        this.changeDOM();
    }
    computeHeight() {
        if (!this.rows.length) {
            return {
                clusterHeight: 0,
                blockHeight: this.state.blockHeight,
                itemHeight: this.state.itemHeight
            };
        } else {
            const nodes = this.contentElement && this.contentElement.children || [];
            const node = nodes[Math.floor(nodes.length / 2)];

            let itemHeight = (node as any).offsetHeight;

            if (this.options.tag === 'tr' && getElementStyle(this.contentElement, 'borderCollapse') !== 'collapse') {
                itemHeight += parseInt(getElementStyle(this.contentElement, 'borderSpacing'), 10) || 0;
            }

            if (this.options.tag !== 'tr') {
                const marginTop = parseInt(getElementStyle(node, 'marginTop'), 10) || 0;
                const marginBottom = parseInt(getElementStyle(node, 'marginBottom'), 10) || 0;
                itemHeight += Math.max(marginTop, marginBottom);
            }

            return {
                blockHeight: this.state.itemHeight * this.options.rowsInBlock,
                clusterHeight: this.state.blockHeight * this.options.blocksInCluster,
                itemHeight
            };
        }
    }
    getCurrentClusterIndex() {
        if (!this.scrollElement) {
          return 0;
        }
        const { blockHeight, clusterHeight } = this.state;
        if (!blockHeight || !clusterHeight) {
            return 0;
        }
        return Math.floor(this.scrollElement.scrollTop / (clusterHeight - blockHeight)) || 0;
    }
    generateEmptyRow() {
        const { tag, emptyText, emptyClass } = this.options;

        if (!tag || !emptyText) {
            return [];
        }

        const emptyRow = document.createElement(tag);
        emptyRow.className = emptyClass;

        if (tag === 'tr') {
            const td = document.createElement('td');
            td.colSpan = 100;
            td.appendChild(document.createTextNode(emptyText));
            emptyRow.appendChild(td);
        } else {
            emptyRow.appendChild(document.createTextNode(emptyText));
        }

        return [emptyRow.outerHTML];
    }
    renderExtraTag(className: string, height?: string | number) {
        const tag = document.createElement(this.options.tag || '<div>');
        const prefix = 'infinite-tree-';

        tag.className = [
            prefix + 'extra-row',
            prefix + className
        ].join(' ');

        if (height) {
            tag.style.height = height + 'px';
        }

        return tag.outerHTML;
    }
    changeDOM() {
        if (!this.state.clusterHeight && this.rows.length > 0) {
            if (!this.contentElement || this.contentElement.children.length <= 1) {
                this.cache.content = this.setContent(this.rows[0] + this.rows[0] + this.rows[0]);
            }

            if (this.contentElement && !this.options.tag) {
                this.options.tag = this.contentElement.children[0].tagName.toLowerCase();
            }

            this.state = { ...this.state, ...this.computeHeight() };
        }

        let topOffset = 0;
        let bottomOffset = 0;
        let rows = [];

        if (this.rows.length < this.options.rowsInBlock) {
            rows = (this.rows.length > 0) ? this.rows : this.generateEmptyRow();
        } else {
            const rowsInCluster = this.options.rowsInBlock * this.options.blocksInCluster;
            const clusterIndex = this.getCurrentClusterIndex();
            const visibleStart = Math.max((rowsInCluster - this.options.rowsInBlock) * clusterIndex, 0);
            const visibleEnd = visibleStart + rowsInCluster;

            topOffset = Math.max(visibleStart * this.state.itemHeight, 0);
            bottomOffset = Math.max((this.rows.length - visibleEnd) * this.state.itemHeight, 0);

            // Returns a shallow copy of the rows selected from `visibleStart` to `visibleEnd` (`visibleEnd` not included).
            rows = this.rows.slice(visibleStart, visibleEnd);
        }

        const content = rows.join('');
        const contentChanged = this.checkChanges('content', content);
        const topOffsetChanged = this.checkChanges('top', topOffset);
        const bottomOffsetChanged = this.checkChanges('bottom', bottomOffset);

        if (contentChanged || topOffsetChanged) {
            const layout = [];

            if (topOffset > 0) {
                if (this.options.keepParity) {
                    layout.push(this.renderExtraTag('keep-parity'));
                }
                layout.push(this.renderExtraTag('top-space', topOffset));
            }

            layout.push(content);

            if (bottomOffset > 0) {
                layout.push(this.renderExtraTag('bottom-space', bottomOffset));
            }

            this.emit('clusterWillChange');

            this.setContent(layout.join(''));

            this.emit('clusterDidChange');
        } else if (bottomOffsetChanged && this.contentElement && this.contentElement.lastChild) {
            (this.contentElement.lastChild as any).style.height = bottomOffset + 'px';
        }
    }
    setContent(content: string) {
      if (this.contentElement) {
        this.contentElement.innerHTML = content;
      }
    }
    getChildNodes(tag: HTMLElement) {
        const childNodes = tag.children;
        const nodes = [];
        const length = childNodes.length;

        for (let i = 0; i < length; i++) {
            nodes.push(childNodes[i]);
        }

        return nodes;
    }
    checkChanges(type: string, value: any) {
        const changed = (value !== this.cache[type]);
        this.cache[type] = value;
        return changed;
    }
}

export default Clusterize;
