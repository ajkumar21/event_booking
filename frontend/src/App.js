import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch, Link } from 'react-router-dom';
import AuthPage from './pages/Auth';
import EventsPage from './pages/Events';
import BookingsPage from './pages/Bookings';
import AuthContext from './context/auth-context';

import { Button, Icon, Menu, Segment, Sidebar } from 'semantic-ui-react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      userId: null,
      visible: false
    };
  }

  handleHideClick = () => this.setState({ visible: false });
  handleShowClick = () => this.setState({ visible: true });
  handleSidebarHide = () => this.setState({ visible: false });

  login = (token, userId, tokenExpiration) => {
    this.setState({ token, userId });
  };

  logout = () => {
    this.setState({ token: null, userId: null });
  };

  render() {
    const { visible, token } = this.state;
    return (
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            token: this.state.token,
            userId: this.state.userId,
            login: this.login,
            logout: this.logout
          }}
        >
          <div>
            <Button onClick={this.handleShowClick}>
              <Icon name='angle double right' />
            </Button>
            <Sidebar
              as={Menu}
              animation='slide along'
              icon='labeled'
              inverted
              onHide={this.handleSidebarHide}
              vertical
              visible={visible}
              width='thin'
            >
              {!token && (
                <Menu.Item as={Link} to='/auth'>
                  <Icon name='sign-in' />
                  Sign In
                </Menu.Item>
              )}
              <Menu.Item as='a'>
                <Icon name='calendar alternate outline' />
                Events
              </Menu.Item>
              {token && (
                <React.Fragment>
                  <Menu.Item as={Link} to='/bookings'>
                    <Icon name='book' />
                    Bookings
                  </Menu.Item>

                  <Menu.Item as='a' onClick={this.logout}>
                    <Icon name='sign-out' />
                    Logout
                  </Menu.Item>
                </React.Fragment>
              )}
            </Sidebar>

            <Sidebar.Pusher dimmed={visible}>
              <Segment basic>
                <main className='main-content'>
                  <Switch>
                    {!this.state.token && (
                      <Redirect from='/' to='/auth' exact />
                    )}
                    {!this.state.token && (
                      <Redirect from='/bookings' to='/auth' exact />
                    )}

                    {this.state.token && (
                      <Redirect from='/' to='/events' exact />
                    )}
                    {this.state.token && (
                      <Redirect from='/auth' to='/events' exact />
                    )}

                    {!this.state.token && (
                      <Route path='/auth' component={AuthPage} />
                    )}
                    <Route path='/events' component={EventsPage} />
                    {this.state.token && (
                      <Route path='/bookings' component={BookingsPage} />
                    )}
                  </Switch>
                </main>
              </Segment>
            </Sidebar.Pusher>
          </div>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
