import * as React from 'react';

//const DEFAULT_USER_AGENT =
//  'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Safari/537.2';
//const USER_AGENT =
//  typeof navigator !== 'undefined' ? navigator.userAgent : DEFAULT_USER_AGENT;


export interface Props {
  className: string
  children: any
  size: string | number | undefined
  split: 'vertical' | 'horizontal'
  style: any
};

/*
Pane.defaultProps = {
  prefixer: new Prefixer({ userAgent: USER_AGENT }),
};
*/

interface State {
  size: number | string | undefined
}

export default class Pane extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { size: this.props.size };
    // console.log(`Pane ${this.props.className} size: ${this.state.size}`)
  }

  render() {
    const {
      children,
      className,
      split,
      style: styleProps,
    } = this.props;
    const { size } = this.state;
    const classes = ['Pane', split, className];

    const style = Object.assign({}, styleProps || {}, {
      flex: 1,
      position: 'relative',
      outline: 'none',
    });

    if (size !== undefined) {
      if (split === 'vertical') {
        // console.log(`Setting ${this.props.className} to vertical size ${size}`)
        style.width = size;
      } else {
        style.height = size;
        style.display = 'flex';
      }
      style.flex = 'none';
    } else {
      // console.log(`Setting ${this.props.className} to undefined size`)
    }

    return (
      <div className={classes.join(' ')} style={style}>
        {children}
      </div>
    );
  }
}
