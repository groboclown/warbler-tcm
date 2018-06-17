import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Home from '../components/Home';
import ProjectSidebar from '../components/ProjectSidebar'
//import SplitPane from 'react-split-pane'
import SplitPane from '../components/SplitPane'

let styles = require('./HomePage.scss');

interface HomePageState {
  sidebarOpen: boolean
  size?: number
}

/**
 * Splits the page into a project view and a tab view.
 */
export class HomePage extends React.Component<RouteComponentProps<any>, HomePageState> {
  render() {
    //let sidebarContent = <ProjectSidebar/>
    return (
      <div className={styles.root}>
        <SplitPane
              defaultSize="20%"
              minSize="5"
              split="vertical">
          <ProjectSidebar/>
          <Home/>
        </SplitPane>
      </div>
    );
  }

  constructor(props: any) {
    super(props)
    this.state = {
      sidebarOpen: true,
      size: 0.2
    }
  }

  onSetSidebarOpen(open: boolean) {
    this.setState({sidebarOpen: open})
  }
}

export default (HomePage as any as React.StatelessComponent<RouteComponentProps<any>>);
