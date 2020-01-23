import React, { useState, useEffect, useRef } from 'react'
import { StatusBar, AsyncStorage } from 'react-native'
import { Appearance, AppearanceProvider } from 'react-native-appearance'
import { SplashScreen } from 'expo'
import * as Font from 'expo-font'
import {
  configureFonts,
  DarkTheme,
  DefaultTheme,
  Provider as PaperProvider
} from 'react-native-paper'
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation'

import { getUserInfo, updateEditorPreferences } from './lib/network'
import CustomHeader from './components/ui/CustomHeader'
import SettingsContext from './components/wrappers/SettingsContext'
import InitialScreen from './screens/Initial'
import WelcomeScreen from './screens/auth/Welcome'
import LogInScreen from './screens/auth/LogIn'
import SignUpScreen from './screens/auth/SignUp'
import HelloScreen from './screens/auth/Hello'
import GoogleProviderScreen from './screens/auth/providers/Google'
import GitHubProviderScreen from './screens/auth/providers/GitHub'
import FacebookProviderScreen from './screens/auth/providers/Facebook'
import DashboardScreen from './screens/app/Dashboard'
import SettingsScreen from './screens/app/Settings'
import LoadReplScreen from './screens/app/LoadRepl'
import ReplScreen from './screens/app/Repl'
import FileScreen from './screens/app/File'

const AuthNavigator = createStackNavigator(
  {
    Welcome: WelcomeScreen,
    LogIn: LogInScreen,
    SignUp: SignUpScreen,
    Hello: HelloScreen,

    GoogleProvider: GoogleProviderScreen,
    GitHubProvider: GitHubProviderScreen,
    FacebookProvider: FacebookProviderScreen
  },
  {
    initialRouteName: 'Welcome',
    defaultNavigationOptions: {
      header: (props) => <CustomHeader {...props} />
    }
  }
)

const AppNavigator = createStackNavigator(
  {
    Dashboard: DashboardScreen,
    Settings: SettingsScreen,
    LoadRepl: LoadReplScreen,
    Repl: ReplScreen,
    File: FileScreen
  },
  {
    initialRouteName: 'Dashboard',
    defaultNavigationOptions: {
      header: (props) => <CustomHeader {...props} />
    }
  }
)

const Navigator = createSwitchNavigator(
  {
    Initial: createStackNavigator(
      {
        Initial: InitialScreen
      },
      {
        defaultNavigationOptions: {
          header: (props) => <CustomHeader {...props} />
        }
      }
    ),
    Auth: AuthNavigator,
    App: AppNavigator
  },
  { initialRouteName: 'Initial' }
)
const App = createAppContainer(Navigator)

const roundness = 2

const fonts = configureFonts({
  default: {
    regular: {
      fontFamily: 'IBM Plex Sans',
      fontWeight: 'normal'
    },
    medium: {
      fontFamily: 'IBM Plex Sans Medium',
      fontWeight: 'normal'
    },
    light: {
      fontFamily: 'IBM Plex Sans Light',
      fontWeight: 'normal'
    },
    thin: {
      fontFamily: 'IBM Plex Sans Thin',
      fontWeight: 'normal'
    }
  }
})

const darkTheme = {
  ...DarkTheme,
  roundness,
  fonts,
  colors: {
    ...DarkTheme.colors,
    primary: '#ffffff',
    accent: '#455a64'
  }
}
const lightTheme = {
  ...DefaultTheme,
  roundness,
  fonts,
  colors: {
    ...DefaultTheme.colors,
    primary: '#222222',
    accent: '#222222'
  }
}

const updateSettings = async (settings) => {
  const { user: editor_preferences } = await getUserInfo()
  await updateEditorPreferences({
    ...editor_preferences,
    theme: settings.theme,
    wrapping: settings.softWrapping,
    indentIsSpaces: settings.softTabs,
    indentSize: settings.indentSize
  })
}

const Main = () => {
  const useSystemTheme = useRef(false)
  const [theme, setTheme] = useState('replitDark')
  const [systemTheme, setSystemTheme] = useState('replitDark')

  const [softWrapping, setSoftWrapping] = useState(false)
  const [softTabs, setSoftTabs] = useState(true)
  const [indentSize, setIndentSize] = useState(2)
  const [redirectRoute, setRedirectRoute] = useState(null)

  const firstUpdate = useRef(true)
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    try {
      updateSettings({
        theme,
        softWrapping,
        softTabs,
        indentSize
      })
    } catch (error) {
      // Unhandled on purpose
    }
  }, [theme, softWrapping, softTabs, indentSize])

  useEffect(() => {
    ;(async () => {
      SplashScreen.preventAutoHide()

      await Font.loadAsync({
        Inconsolata: require('./assets/fonts/Inconsolata-Regular.ttf'),
        'IBM Plex Sans': require('./assets/fonts/IBMPlexSans-Regular.ttf'),
        'IBM Plex Sans Medium': require('./assets/fonts/IBMPlexSans-Medium.ttf'),
        'IBM Plex Sans Light': require('./assets/fonts/IBMPlexSans-Light.ttf'),
        'IBM Plex Sans Thin': require('./assets/fonts/IBMPlexSans-Thin.ttf')
      })

      useSystemTheme.current = (await AsyncStorage.getItem('@useSystemTheme')) === 'yes'
      const colorScheme = Appearance.getColorScheme()
      if (colorScheme === 'dark') {
        setSystemTheme('replitDark')
      } else if (colorScheme === 'light') {
        setSystemTheme('replitLight')
      }

      const { success, user } = await getUserInfo()

      if (success) {
        const {
          editor_preferences: { theme, indentIsSpaces, indentSize, wrapping }
        } = user

        setTheme(theme)
        setSoftTabs(indentIsSpaces)
        setIndentSize(indentSize.toString())
        setSoftWrapping(wrapping)

        setRedirectRoute('App')
      } else setRedirectRoute('Auth')

      SplashScreen.hide()
    })()
  }, [])

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('change')
      if (colorScheme === 'dark') {
        setSystemTheme('replitDark')
      } else if (colorScheme === 'light') {
        setSystemTheme('replitLight')
      } else return
      AsyncStorage.setItem('@useSystemTheme', 'yes')
    })
    return () => subscription.remove()
  })

  return (
    <PaperProvider theme={theme === 'replitDark' ? darkTheme : lightTheme}>
      <StatusBar barStyle="light-content" />
      <SettingsContext.Provider
        value={{
          theme: useSystemTheme.current ? systemTheme : theme,
          setTheme: (theme) => {
            setTheme(theme)
            AsyncStorage.setItem('@useSystemTheme', 'no')
          },
          softWrapping,
          setSoftWrapping,
          softTabs,
          setSoftTabs,
          indentSize,
          setIndentSize,
          redirectRoute,
          updateSettings
        }}
      >
        {console.log(
          `(${new Date().toLocaleTimeString()} rendering, theme=${theme}, useSystemTheme=${
            useSystemTheme.current
          })`
        )}
        {redirectRoute && <App />}
      </SettingsContext.Provider>
    </PaperProvider>
  )
}

export default () => (
  <AppearanceProvider>
    <Main />
  </AppearanceProvider>
)
