import * as React from 'react';

//const DEFAULT_USER_AGENT =
//  'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Safari/537.2';
//const USER_AGENT =
//  typeof navigator !== 'undefined' ? navigator.userAgent : DEFAULT_USER_AGENT;
export const RESIZER_DEFAULT_CLASSNAME = 'Resizer';

interface Props {
  className: string
  onClick?: Function
  onDoubleClick?: Function
  onMouseDown: Function
  onTouchStart: Function
  onTouchEnd: Function
  split: 'vertical' | 'horizontal'
  style?: any
  resizerClassName: string
};

interface State {

}

/*
Resizer.defaultProps = {
  prefixer: new Prefixer({ userAgent: USER_AGENT }),
  resizerClassName: RESIZER_DEFAULT_CLASSNAME,
};
*/


export class Resizer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    let {
      className,
      onClick,
      onDoubleClick,
      onMouseDown,
      onTouchEnd,
      onTouchStart,
      resizerClassName,
      split,
      style,
    } = this.props;
    resizerClassName = resizerClassName || RESIZER_DEFAULT_CLASSNAME;
    const classes = [resizerClassName, split, className];

    style = Object.assign(style || {}, {
      flex: '0 0 5px',
      cursor: 'col-resize',
      backgroundColor: 'black'
    })

    return (
      <span
        className={classes.join(' ')}
        style={style}
        onMouseDown={(event: any) => onMouseDown(event)}
        onTouchStart={(event: any) => {
          event.preventDefault();
          onTouchStart(event);
        }}
        onTouchEnd={(event: any) => {
          event.preventDefault();
          onTouchEnd(event);
        }}
        onClick={(event: any) => {
          if (onClick) {
            event.preventDefault();
            onClick(event);
          }
        }}
        onDoubleClick={(event: any) => {
          if (onDoubleClick) {
            event.preventDefault();
            onDoubleClick(event);
          }
        }}
      />
    );
  }
}
