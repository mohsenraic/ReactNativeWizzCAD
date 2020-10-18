import * as React from 'react';
import { Button, View, Text, TextInput, StyleSheet, AsyncStorage } from 'react-native';
import { API_ENDPOINT, DEMO_USER, DEMO_PASS, AUTH_KEY } from '../utils/Constants';
import { AuthApi } from '../api/AuthApi';

interface LoginState {
  username: string,
  password: string
}

interface LoginProps {
  navigation?: any;
}

export class Login extends React.Component<LoginProps, LoginState> {



  constructor(props: any) {
    super(props);
    this.state = {
      username: DEMO_USER,
      password: DEMO_PASS
    }
  }

  componentDidMount() {


  }

  login() {
    AuthApi.auth(this.state.username, this.state.password).then((res) => {
      if (res[0].token) {
        AsyncStorage.setItem(AUTH_KEY, res[0].token).then((res) => {
          this.props.navigation.navigate('Details')

        })
      }
    }).catch((error) => {
      alert("Identifiant ou mot de passe incorrect")
    });
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.title}>Bienvenue</Text>


        <View style={styles.inputContainer}>
          <Text style={styles.label}>Identifiant</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => this.setState({ username: text })}
            value={this.state.username}
          />
        </View>


        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => this.setState({ password: text })}
            value={this.state.password}
          />
        </View>


        <Button
          title="Se connecter"
          onPress={() => this.login()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    padding: 40
  },
  label: {
    fontSize: 15,
    paddingBottom: 10
  },
  input: {
    height: 40,
    width: 300,
    paddingHorizontal: 5,
    backgroundColor: 'white',
    marginBottom: 5,
  },
  inputContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  error: { textAlign: 'center', color: 'red' },
});