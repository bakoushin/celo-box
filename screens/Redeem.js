import React, { useContext, useState } from 'react';
import {
  Alert,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  Card,
  Divider,
  Text,
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction
} from '@ui-kitten/components';
import millify from 'millify';
import AppContext from '../AppContext';
import ButtonAsync from '../components/ButtonAsync';
import background from '../assets/background.png';
import { redeem, getBoxSummary } from '../api/box';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    boxAddress,
    title,
    receiverAddress,
    balance,
    currency,
    imageSource,
    parentScreen,
    isPublic
  } = route.params;

  const {
    state: { network },
    dispatch
  } = useContext(AppContext);

  const navigateBack = () => {
    navigation.goBack();
  };

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  );

  const dismiss = () => {
    if (parentScreen) navigation.navigate(parentScreen, { mod: Math.random() });
    else navigation.pop();
  };

  const redeemBox = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await redeem({ boxAddress, receiverAddress, network, currency });

      const boxSummary = await getBoxSummary(boxAddress, network);
      dispatch({
        type: isPublic ? 'UPDATE_PUBLIC_BOX' : 'UPDATE_PERSONAL_BOX',
        data: { boxAddress, ...boxSummary }
      });

      setLoading(false);
      setDone(true);
      Alert.alert(
        `✅  You've redeemed the box of ${balance} ${currency}!`,
        null,
        [{ text: 'Great!', onPress: dismiss }],
        {
          cancelable: true,
          onDismiss: dismiss
        }
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(String(error));
      setLoading(false);
    }
  };

  const Error = () =>
    !!errorMessage && (
      <Card style={styles.row} status="danger">
        <Text>⛔️ Error: {errorMessage}</Text>
      </Card>
    );

  return (
    <Layout style={styles.container}>
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Redeem"
          alignment="center"
          accessoryLeft={BackAction}
        />
        <Divider />
        <ScrollView style={styles.container}>
          <ImageBackground
            source={imageSource ? imageSource : background}
            resizeMode="cover"
            style={{
              width: '100%',
              height: 150
            }}
          >
            <View
              style={{
                flex: 1,
                padding: 8,
                paddingRight: 100,
                backgroundColor: '#0004',
                justifyContent: 'flex-end'
              }}
            >
              <Text
                style={{
                  color: '#fff'
                }}
                category="h2"
              >
                {title}
              </Text>
            </View>
          </ImageBackground>
          <View style={[styles.container, { padding: 8 }]}>
            <Error />
            <View style={styles.row}>
              {done && (
                <Text
                  style={{ textAlign: 'center', padding: 8 }}
                  status="success"
                  category="s1"
                >
                  R E D E E M E D
                </Text>
              )}
              {!done && (
                <View style={styles.container}>
                  <ButtonAsync
                    status="success"
                    loading={loading}
                    onPress={redeemBox}
                  >
                    Redeem {millify(balance)} {currency}
                  </ButtonAsync>
                  <Text
                    style={{ textAlign: 'center', paddingVertical: 8 }}
                    appearance="hint"
                  >
                    The box will be locked for any further contribution.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    marginVertical: 8
  }
});
