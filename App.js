// Import React Navigation
import {
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation';
import {
  StatusBar,
  Platform,
  StyleSheet,
  Text,
  View,
  Image
} from "react-native";
import { Font, AppLoading } from 'expo';

import tabBarIcon from './utils/tabBarIcon';
// Import the screens
import FeedScreen from './screens/FeedScreen';
import NewPostScreen from './screens/NewPostScreen';
import SelectPhotoScreen from './screens/SelectPhotoScreen';

import ProfileScreen from "./screens/ProfileScreen";
import { isSignedIn } from "./auth";
import React from "react";
import { Provider } from 'react-redux';
import Register from './app/modules/auth/scenes/Register'

import Welcome from './app/modules/auth/scenes/Welcome'
import Login from './app/modules/auth/scenes/Login'

import store from './app/redux/store';

const headerStyle = {
  marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
};
function cacheFonts(fonts) {
  return fonts.map(font => Font.loadAsync(font));
}

/** Create our main tab navigator for moving between the Feed and Photo screens
**/
const navigator = createBottomTabNavigator(
  {
    // The name `Feed` is used later for accessing screens
    Feed: {
      // Define the component we will use for the Feed screen.
      screen: FeedScreen,
      navigationOptions: {
        // Add a cool Material Icon for this screen
        tabBarIcon: tabBarIcon('home'),
      },
    },
    // All the same stuff but for the Photo screen
    Photo: {
      screen: SelectPhotoScreen,
      navigationOptions: {
        tabBarIcon: tabBarIcon('add-circle'),
      },
    },

    Profile: {
      screen: ProfileScreen,

      navigationOptions: {
        tabBarIcon: tabBarIcon('person'),
      },

    },
  },
  {
    // We want to hide the labels and set a nice 2-tone tint system for our tabs
    tabBarOptions: {
      showLabel: false,
      activeTintColor: 'black',
      inactiveTintColor: 'gray',
    },
  },
);

// Create the navigator that pushes high-level screens like the `NewPost` screen.
const SignedInNavigator = createStackNavigator(
  {
    Main: {
      screen: navigator,
      // Set the title for our app when the tab bar screen is present
      navigationOptions: { title: 'こだわりん 🐷' },
    },
    // This screen will not have a tab bar
    NewPost: NewPostScreen,
  },
  {
    cardStyle: { backgroundColor: 'white' },
  },
);


const WelcomeNavigator = createStackNavigator(

  {
    WelcomeScreen: {
      screen: Welcome
    },
   
    LoginWithEmail: {
      screen: Login
    },
    SignUpWithEmail: {
      screen: Register
    },
  },
);




export const createRootNavigator = (signedIn = false) => {
  return createSwitchNavigator(
    {

      SignedIn: {
        screen: SignedInNavigator
      },
      SignedOut: {
        screen: WelcomeNavigator,

      }
    },
    {
      initialRouteName: signedIn ? "SignedIn" : "SignedOut"
    }
  );
};


export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      signedIn: false,
      checkedSignIn: false,
    };

    // this.image = require('./assets/dumbbell.jpg');
    this.state = { result: "" }
  }

  componentDidMount() {


    isSignedIn()
      .then(res => this.setState({ signedIn: res, checkedSignIn: true }))
      .catch(err => alert("An error occurred"));
  }
  async _loadAssetsAsync() {
    const fontAssets = cacheFonts([
      { RobotoExtraBold: require('./app/assets/fonts/Roboto-Black.ttf') },
      { RobotoBold: require('./app/assets/fonts/Roboto-Bold.ttf') },
      { RobotoMedium: require('./app/assets/fonts/Roboto-Medium.ttf') },
      { RobotoRegular: require('./app/assets/fonts/Roboto-Regular.ttf') },
      { RobotoLight: require('./app/assets/fonts/Roboto-Light.ttf') }
    ]);

    await Promise.all([...fontAssets]);
  }

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._loadAssetsAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      );
    }

    const { checkedSignIn, signedIn } = this.state;

    // If we haven't checked AsyncStorage yet, don't render anything (better ways to do this)
    if (!checkedSignIn) {
      return null;
    }

    const Layout = createRootNavigator(signedIn);
    return (
      <Provider store={store}>
        <Layout />
      </Provider>);
  }
}


