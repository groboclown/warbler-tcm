import * as React from 'react';

let styles = require('./Home.scss');

export default class Home extends React.Component {
  render() {
    return (
      <div className={styles.container} data-tid="container">
        <div>
          We are home.
        </div>
        <div>now!</div>
        <div>Home!</div>
      </div>
    );
  }
}
