import React, { useReducer } from 'react';
import { Appearance, StatusBar, LogBox } from 'react-native';
import * as eva from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { AppearanceProvider } from 'react-native-appearance';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as firebase from 'firebase';
import firebaseConfig from './firebaseConfig';
import Home from './screens/Home';
import BoxEditor from './screens/BoxEditor';
import BoxView from './screens/BoxView';
import Contribute from './screens/Contribute';
import Redeem from './screens/Redeem';
import Finalize from './screens/Finalize';
import RevokeContribution from './screens/RevokeContribution';
import AppContext from './AppContext';
import { reducer, initialState } from './AppReducer';

LogBox.ignoreLogs([
  "Warning: The provided value 'moz",
  "Warning: The provided value 'ms-stream",
  'web3-shh package will be deprecated',
  'web3-bzz package will be deprecated',
  'storage/quota-exceeded'
]);

const { Navigator, Screen } = createStackNavigator();

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const barStyle = (theme) => {
  switch (theme) {
    case eva.light:
      return 'dark-content';
    case eva.dark:
      return 'light-content';
    default:
      return 'default';
  }
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const colorScheme = Appearance.getColorScheme();
  const theme = eva[colorScheme] || eva.light;

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <AppearanceProvider>
        <ApplicationProvider {...eva} theme={theme}>
          <StatusBar barStyle={barStyle(theme)} />
          <AppContext.Provider value={{ state, dispatch }}>
            <NavigationContainer>
              <Navigator headerMode="none">
                <Screen name="Home" component={Home} />
                <Screen name="BoxEditor" component={BoxEditor} />
                <Screen name="BoxView" component={BoxView} />
                <Screen name="Contribute" component={Contribute} />
                <Screen name="Redeem" component={Redeem} />
                <Screen name="Finalize" component={Finalize} />
                <Screen
                  name="RevokeContribution"
                  component={RevokeContribution}
                />
              </Navigator>
            </NavigationContainer>
          </AppContext.Provider>
        </ApplicationProvider>
      </AppearanceProvider>
    </>
  );
}
