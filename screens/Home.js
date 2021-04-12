import React, { useContext, useEffect } from 'react';
import { Image, SafeAreaView, View } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Button,
  Divider,
  Text,
  TopNavigation,
  BottomNavigation,
  BottomNavigationTab
} from '@ui-kitten/components';
import BoxList from '../components/BoxList';
import box from '../assets/box.png';
import Network from '../components/Network';
import AppContext from '../AppContext';
import * as Linking from 'expo-linking';

const { Navigator, Screen } = createBottomTabNavigator();

const BottomTabBar = ({ navigation, state }) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}
  >
    <BottomNavigationTab title="PUBLIC" />
    <BottomNavigationTab title="PERSONAL" />
  </BottomNavigation>
);

const CreateButton = ({ route, navigation }) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  const isPublic = routeName !== 'Personal boxes';

  const navigateDetails = () => {
    navigation.navigate('BoxEditor', { isPublic });
  };

  return (
    <Button
      appearance="ghost"
      onPress={navigateDetails}
      style={{ paddingHorizontal: 0 }}
    >
      Create box
    </Button>
  );
};

const PublicBoxes = () => <BoxList isPublic={true} />;
const PersonalBoxes = () => <BoxList isPublic={false} />;

export default ({ route, navigation }) => {
  const { dispatch } = useContext(AppContext);

  const redirectUrl = (url) => {
    const {
      queryParams: { network, boxAddress }
    } = Linking.parse(url);

    if (!boxAddress) {
      return;
    }
    if (network) {
      dispatch({
        type: 'SET_NETWORK',
        network
      });
    }
    navigation.navigate('BoxView', { boxAddress });
  };

  useEffect(() => {
    Linking.getInitialURL().then(redirectUrl);
    Linking.addEventListener('url', ({ url }) => redirectUrl(url));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopNavigation
        alignment="center"
        accessoryLeft={() => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={box} style={{ marginHorizontal: 8 }} />
            <Text category="h6">The Box</Text>
          </View>
        )}
        accessoryRight={() => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Network />
            <CreateButton route={route} navigation={navigation} />
          </View>
        )}
      />
      <Divider />
      <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
        <Screen name="Public boxes" component={PublicBoxes} />
        <Screen name="Personal boxes" component={PersonalBoxes} />
      </Navigator>
    </SafeAreaView>
  );
};
