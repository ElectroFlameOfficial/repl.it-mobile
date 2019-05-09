import React, { Component } from 'react'
import { StatusBar, AsyncStorage } from 'react-native'
import { Font } from 'expo'
import { DarkTheme, DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation'
import CustomHeader from './components/CustomHeader'
import SettingsContext from './components/SettingsContext'

import InitialScreen from './screens/Initial'

import WelcomeScreen from './screens/Auth/Welcome'
import LogInScreen from './screens/Auth/LogIn'
import SignUpScreen from './screens/Auth/SignUp'
import HelloScreen from './screens/Auth/Hello'

import GoogleProviderScreen from './screens/Auth/Providers/Google'
import GitHubProviderScreen from './screens/Auth/Providers/GitHub'
import FacebookProviderScreen from './screens/Auth/Providers/Facebook'

import DashboardScreen from './screens/App/Dashboard'
import SettingsScreen from './screens/App/Settings'
import ReplScreen from './screens/App/Repl'
import FileScreen from './screens/App/File'

const AuthNavigator = createStackNavigator({
  Welcome: WelcomeScreen,
  LogIn: LogInScreen,
  SignUp: SignUpScreen,
  Hello: HelloScreen,

  GoogleProvider: GoogleProviderScreen,
  GitHubProvider: GitHubProviderScreen,
  FacebookProvider: FacebookProviderScreen
}, {
  initialRouteName: 'Welcome',
  defaultNavigationOptions: {
    header: (props) => <CustomHeader {...props} />
  }
})

const AppNavigator = createStackNavigator({
  Dashboard: DashboardScreen,
  Settings: SettingsScreen,
  Repl: ReplScreen,
  File: FileScreen
}, {
  initialRouteName: 'Dashboard',
  defaultNavigationOptions: {
    header: (props) => <CustomHeader {...props} />
  }
})

const Navigator = createSwitchNavigator({
  Initial: createStackNavigator({
    Initial: InitialScreen
  }, {
    defaultNavigationOptions: {
      header: (props) => <CustomHeader {...props} />
    }
  }),
  Auth: AuthNavigator,
  App: AppNavigator
}, { initialRouteName: 'Initial' })
const App = createAppContainer(Navigator)

const accent = '#687d85'
const primary = '#e83d39'
const roundness = 0
export default class extends Component {
  state = {
    theme: {
      ...DefaultTheme,
      roundness,
      colors: {
        ...DefaultTheme.colors,
        primary, accent
      }
    },
    softWrapping: false,
    softTabs: true,
    indentSize: '2'
  }

  render() {
    return (
      <PaperProvider theme={this.state.theme}>
        <StatusBar barStyle='light-content' />
        <SettingsContext.Provider value={{
          theme: this.state.theme.dark,
          setTheme: this.setTheme,
          softWrapping: this.state.softWrapping,
          setSoftWrapping: this.setSoftWrapping,
          softTabs: this.state.softTabs,
          setSoftTabs: this.setSoftTabs,
          indentSize: this.state.indentSize,
          setIndentSize: this.setIndentSize
        }}>
          <App />
        </SettingsContext.Provider>
      </PaperProvider>
    )
  }

  setTheme = async (dark) => {
    this.setState({
      theme: {
        ...(dark ? DarkTheme : DefaultTheme),
        roundness,
        colors: {
          ...(dark ? DarkTheme.colors : DefaultTheme.colors),
          primary, accent
        }
      }
    })
    await AsyncStorage.setItem('@dark', dark ? 'glory' : '')
  }

  setSoftWrapping = async (softWrapping) => {
    this.setState({ softWrapping })
    await AsyncStorage.setItem('@wrapping', softWrapping ? 'soft' : 'hard')
  }

  setSoftTabs = async (softTabs) => {
    this.setState({ softTabs })
    await AsyncStorage.setItem('@tabs', softTabs ? 'soft' : 'hard')
  }

  setIndentSize = async (indentSize) => {
    if (!/^[0-9]+$/.test(indentSize)) return
    this.setState({ indentSize })
    await AsyncStorage.setItem('@indent', indentSize)
  }

  async componentDidMount() {
    const theme = await AsyncStorage.getItem('@dark')
    this.setTheme(theme === 'glory')

    const wrapping = await AsyncStorage.getItem('@wrapping')
    this.setSoftWrapping(wrapping === 'soft')

    const tabs = await AsyncStorage.getItem('@tabs')
    this.setSoftTabs(tabs !== 'hard')

    const indentSize = await AsyncStorage.getItem('@indent')
    this.setIndentSize(indentSize || '2')

    await Font.loadAsync('inconsolata', require('./assets/Inconsolata-Regular.ttf'))
  }
}