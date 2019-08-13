import React, { Component } from 'react';
import './Auth.css';
import AuthContext from '../context/auth-context';
import '../index.css';

import { Button, Form, Grid, Header, Segment } from 'semantic-ui-react';

class AuthPage extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      isLogin: true,
      email: '',
      password: ''
    };
  }

  submitHandler = e => {
    e.preventDefault();
    const email = this.state.email;
    const password = this.state.password;
    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `query Login($email: String!, $password: String!) {login(email:$email, password:$password){userId token tokenExpiration}}`,
      variables: {
        email: email,
        password: password
      }
    };

    if (!this.state.isLogin) {
      requestBody = {
        query: `mutation CreateUser($email: String!, $password: String!) {createUser(input:{email:$email, password:$password}){
          _id email
        }
      }
      `,
        variables: {
          email: email,
          password: password
        }
      };
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'content-type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed');
        }
        return res.json();
      })
      .then(resData => {
        if (resData.data.login.token) {
          this.context.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.tokenExpiration
          );
        }
      })
      .catch(err => console.log(err));
  };

  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    });
  };

  render() {
    return (
      <Grid
        textAlign='center'
        style={{ height: '100vh' }}
        verticalAlign='middle'
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' color='teal' textAlign='center'>
            Log-in to your account
          </Header>
          <Form size='large' onSubmit={this.submitHandler}>
            <Segment stacked>
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                placeholder='E-mail address'
                onChange={e => {
                  this.setState({ email: e.target.value });
                }}
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                type='password'
                onChange={e => {
                  this.setState({ password: e.target.value });
                }}
              />

              <Button color='teal' fluid size='large' type='submit'>
                {this.state.isLogin ? 'Login' : 'Sign up'}
              </Button>
            </Segment>
          </Form>
          <br />
          <Button
            color='teal'
            fluid
            size='large'
            onClick={this.switchModeHandler}
          >
            Switch to {this.state.isLogin ? 'Sign Up' : 'Login'}
          </Button>
        </Grid.Column>
      </Grid>
    );
  }
}

export default AuthPage;
