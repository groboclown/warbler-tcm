import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Pane from './Pane';
import { Resizer, RESIZER_DEFAULT_CLASSNAME} from './Resizer';

//const DEFAULT_USER_AGENT =
//  'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Safari/537.2';
//const USER_AGENT =
//  typeof navigator !== 'undefined' ? navigator.userAgent : DEFAULT_USER_AGENT;

function unFocus(document: any, window: any) {
  if (document.selection) {
    document.selection.empty();
  } else {
    try {
      window.getSelection().removeAllRanges();
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}

export type Size = string | number;

export interface Props {
    children: any[]
    className?: string;
    primary?: 'first' | 'second';
    minSize?: Size;
    maxSize?: Size;
    defaultSize?: Size;
    size?: Size;
    split: 'vertical' | 'horizontal';
    onDragStarted?: () => void;
    onDragFinished?: (newSize: number) => void;
    onChange?: (newSize: number) => void;
    onResizerClick?: (event: MouseEvent) => void;
    onResizerDoubleClick?: (event: MouseEvent) => void;
    style?: React.CSSProperties;
    resizerStyle?: React.CSSProperties;
    paneStyle?: React.CSSProperties;
    paneClassName?: string;
    pane1Style?: React.CSSProperties;
    pane1ClassName?: string
    pane2Style?: React.CSSProperties;
    pane2ClassName?: string
    resizerClassName?: string;
    step?: number;
}

export interface State {
    active: boolean
    resized: boolean
    position: number
    draggedSize?: number | undefined
    size?: number | undefined
}
/*
SplitPane.defaultProps = {
  minSize: 50,
  prefixer: new Prefixer({ userAgent: USER_AGENT }),
  primary: 'first',
  split: 'vertical',
  paneClassName: '',
  pane1ClassName: '',
  pane2ClassName: '',
};
*/


class SplitPane extends React.Component<Props, State> {
  private pane1: Pane | null
  private pane2: Pane | null
  private splitPane: HTMLDivElement | null
  private mouseUpListener = () => { this.onMouseUp() }
  private mouseMoveListener = (e: any) => { this.onMouseMove(e) }
  private touchMoveListener = (e: any) => { this.onTouchMove(e) }

  constructor(props: Props) {
    /*
    if (props.minSize === undefined) {
      props.minSize = 50
    }
    props.split = props.split || 'vertical'
    props.primary = props.primary || 'first'
    props.paneClassName = props.paneClassName || ''
    props.pane1ClassName = props.pane1ClassName || ''
    props.pane2ClassName = props.pane2ClassName || ''
    */

    super(props);

    this.state = {
      active: false,
      resized: false,
      position: 0,
      draggedSize: -1
    };
  }

  componentDidMount() {
    this.setSize(this.props, this.state);
    document.addEventListener('mouseup', this.mouseUpListener);
    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('touchmove', this.touchMoveListener);
  }

  componentWillReceiveProps(props: Props) {
    this.setSize(props, this.state);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.mouseUpListener);
    document.removeEventListener('mousemove', this.mouseMoveListener);
    document.removeEventListener('touchmove', this.touchMoveListener);
  }

  onMouseDown(event: any) {
    const eventWithTouches = {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    };
    this.onTouchStart(eventWithTouches);
  }

  onTouchStart(event: any) {
    let { onDragStarted, split } = this.props;
    unFocus(document, window);
    const position =
      split === 'vertical'
        ? event.touches[0].clientX
        : event.touches[0].clientY;

    if (typeof onDragStarted === 'function') {
      onDragStarted();
    }
    this.setState({
      active: true,
      position,
    });
  }

  onMouseMove(event: any) {
    const eventWithTouches = Object.assign({}, event, {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    });
    this.onTouchMove(eventWithTouches);
  }

  onTouchMove(event: any) {
    const { maxSize, minSize, onChange, split, step } = this.props;
    const { active, position } = this.state;
    if (active) {
      unFocus(document, window);
      const isPrimaryFirst = this.props.primary === 'first' || this.props.primary === undefined;
      const ref = isPrimaryFirst ? this.pane1 : this.pane2;
      const ref2 = isPrimaryFirst ? this.pane2 : this.pane1;
      if (ref && ref2) {
        const node = ReactDOM.findDOMNode(ref);
        const node2 = ReactDOM.findDOMNode(ref2);

        if (node.getBoundingClientRect) {
          const width = node.getBoundingClientRect().width;
          const height = node.getBoundingClientRect().height;
          const current =
            split === 'vertical'
              ? event.touches[0].clientX
              : event.touches[0].clientY;
          const size = split === 'vertical' ? width : height;
          let positionDelta = position - current;
          if (step) {
            if (Math.abs(positionDelta) < step) {
              return;
            }
            // Integer division
            // eslint-disable-next-line no-bitwise
            positionDelta = ~~(positionDelta / step) * step;
          }
          let sizeDelta = isPrimaryFirst ? positionDelta : -positionDelta;

          const pane1OrderStr = window.getComputedStyle(node).order
          const pane1Order = parseInt(pane1OrderStr ? (pane1OrderStr as string) : "0");
          const pane2OrderStr = window.getComputedStyle(node2).order
          const pane2Order = parseInt(pane2OrderStr ? (pane2OrderStr as string) : "0");
          if (pane1Order > pane2Order) {
              sizeDelta = -sizeDelta;
          }

          let newMaxSize: number | undefined
          if (maxSize !== undefined && maxSize <= 0 && this.splitPane != null) {
            const splPane = this.splitPane;
            if (split === 'vertical') {
              newMaxSize = splPane.getBoundingClientRect().width + (maxSize as number);
            } else {
              newMaxSize = splPane.getBoundingClientRect().height + (maxSize as number);
            }
          } else {
            newMaxSize = undefined
          }

          let newSize = size - sizeDelta;
          const newPosition = position - positionDelta;

          if (minSize !== undefined && newSize < (minSize as number)) {
            newSize = minSize as number;
          } else if (maxSize !== undefined  && newMaxSize !== undefined && newSize > newMaxSize) {
            newSize = newMaxSize;
          } else {
            this.setState({
              position: newPosition,
              resized: true,
            });
          }

          if (onChange) onChange(newSize);
          this.setState({ draggedSize: newSize });
          ref.setState({ size: newSize });
        }
      }
    }
  }

  onMouseUp() {
    const { onDragFinished } = this.props;
    const { active, draggedSize } = this.state;
    if (active) {
      if (typeof onDragFinished === 'function' && draggedSize !== undefined) {
        onDragFinished(draggedSize);
      }
      this.setState({ active: false });
    }
  }

  setSize(props: Props, state: State) {
    const isPrimaryFirst = props.primary === 'first' || props.primary === undefined;
    const ref = isPrimaryFirst ? this.pane1 : this.pane2;
    const ref2 = isPrimaryFirst ? this.pane2 : this.pane1;
    let newSize: Size | undefined;
    // console.log(`Setting size: ${props.defaultSize}, ${props.minSize}, ${props.maxSize}, ${state.draggedSize}`)
    if (ref) {
      newSize = (props.size !== undefined
        ? props.size
        : getDefaultSize(props.defaultSize, props.minSize, props.maxSize, state.draggedSize)
      );
      if (newSize !== undefined) {
        ref.setState({
          size: newSize as number,
        });
      }
      if ((props.size !== undefined) && newSize !== undefined && (props.size !== state.draggedSize)) {
        this.setState({
          draggedSize: newSize as number,
        });
      }
    }
    if (ref2 && props.primary !== this.props.primary) {
      ref2.setState({
        size: undefined
      });
    }

    function getDefaultSize(defaultSize: Size | undefined, minSize: Size | undefined, maxSize: Size | undefined, draggedSize: Size | undefined): Size | undefined {
      if (typeof draggedSize === 'number' && draggedSize >= 0) {
        const min = (typeof minSize === 'number' ? minSize : 0);
        const max = ((typeof maxSize === 'number') && (maxSize >= 0) ? maxSize : Infinity);
        return Math.max(min, Math.min(max, draggedSize));
      }
      if (defaultSize !== undefined) { return defaultSize; }
      return minSize || 50;
    }
  }

  render() {
    const {
      children,
      className,
      onResizerClick,
      onResizerDoubleClick,
      paneClassName,
      pane1ClassName,
      pane2ClassName,
      paneStyle,
      pane1Style: pane1StyleProps,
      pane2Style: pane2StyleProps,
      primary,
      resizerClassName,
      resizerStyle,
      split,
      style: styleProps,
    } = this.props;
    const resizerClassNamesIncludingDefault = resizerClassName
      ? `${resizerClassName} ${RESIZER_DEFAULT_CLASSNAME}`
      : resizerClassName;

    const style = Object.assign(
      {},
      {
        display: 'flex',
        flex: 1,
        height: '100%',
        position: 'absolute',
        outline: 'none',
        overflow: 'hidden',
        MozUserSelect: 'text',
        WebkitUserSelect: 'text',
        msUserSelect: 'text',
        userSelect: 'text',
      },
      styleProps || {}
    );

    if (split === 'vertical') {
      Object.assign(style, {
        flexDirection: 'row',
        left: 0,
        right: 0,
      });
    } else {
      Object.assign(style, {
        bottom: 5,
        flexDirection: 'column',
        minHeight: '100%',
        top: 0,
        width: '100%',
      });
    }

    const classes = ['SplitPane', className, split];
    const pane1Style = // prefixer.prefix(
    //  Object.assign({}, paneStyle || {}, pane1StyleProps || {})
    //);
        pane1StyleProps || paneStyle || {}
    const pane2Style = //prefixer.prefix(
    //  Object.assign({}, paneStyle || {}, pane2StyleProps || {})
    //);
      pane2StyleProps || paneStyle || {}

    const pane1Classes = ['Pane1', paneClassName, pane1ClassName].join(' ');
    const pane2Classes = ['Pane2', paneClassName, pane2ClassName].join(' ');

    let firstSize = (primary === undefined || primary === 'first') ? this.getPrimaryPaneSize() : undefined;
    let secondSize = primary === 'second' ? this.getPrimaryPaneSize() : undefined;

    return (
      <div
        className={classes.join(' ')}
        ref={node => {
          this.splitPane = node;
        }}
        style={style}
      >
        <Pane
          className={pane1Classes}
          key="pane1"
          ref={node => {
            this.pane1 = node;
          }}
          size={firstSize}
          split={split}
          style={pane1Style}
        >
          {children[0]}
        </Pane>
        <Resizer
          className={''}
          onClick={onResizerClick}
          onDoubleClick={onResizerDoubleClick}
          onMouseDown={(e: any) => { this.onMouseDown(e) }}
          onTouchStart={(e: any) => { this.onTouchStart(e) }}
          onTouchEnd={() => { this.onMouseUp()}}
          key="resizer"
          ref={() => {
            // this.resizer = node;
          }}
          resizerClassName={resizerClassNamesIncludingDefault || RESIZER_DEFAULT_CLASSNAME}
          split={split}
          style={resizerStyle || {}}
        />
        <Pane
          className={pane2Classes}
          key="pane2"
          ref={node => {
            this.pane2 = node;
          }}
          size={secondSize}
          split={split}
          style={pane2Style}
        >
          {children[1]}
        </Pane>
      </div>
    );
  }

  getPrimaryPaneSize(): number | string {
    const { size, defaultSize, minSize } = this.props
    let ret = size !== undefined
      ? size
      : (defaultSize !== undefined
          ? defaultSize
          : (minSize !== undefined
            ? minSize
            : '1'));
    // console.log(`Formatting pane size: size: ${size}, default: ${defaultSize}; minSize: ${minSize}; result: ${ret}`)
    return ret
  }
}

export default SplitPane;
