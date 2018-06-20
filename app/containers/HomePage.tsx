import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Home from '../components/Home';
import ProjectSidebar from '../components/ProjectSidebar'
import SplitPane from '../components/SplitPane'
import { loadSettings } from '../api/settings'
import * as Theme from '../api/state/theme'

let styles = require('./HomePage.scss');

interface HomePageState {
  theme: string
}

/**
 * Splits the page into a project view and a tab view.
 */
export class HomePage extends React.Component<RouteComponentProps<any>, HomePageState> {
  private themeListener: Theme.ThemeChangedListener | null

  render() {
    // TODO make the initial size of the split pane persistent
    return (
      <div className={[styles.root, this.state.theme].join(' ')}>
        <SplitPane
              defaultSize="20%"
              minSize="5"
              split="vertical"
              resizerClassName="resizer-vertical">
          <ProjectSidebar/>
          <Home/>
        </SplitPane>
      </div>
    );
  }

  constructor(props: any) {
    super(props)
    this.state = {
      theme: 'dark'
    }
    loadSettings().then((settings) => {
      this.setState({ theme: settings.getTheme() })
    })
  }

  componentDidMount() {
    this.themeListener = (theme) => { this.setState({
      theme: theme
    })}
    Theme.addThemeChangedListener(this.themeListener)
  }

  componentWillUnmount() {
    if (this.themeListener) {
      Theme.removeThemeChangedListener(this.themeListener)
      this.themeListener = null
    }
  }
}

export default (HomePage as any as React.StatelessComponent<RouteComponentProps<any>>);
