import React, { useContext, useState, useRef } from 'react';
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
  Icon,
  Input,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction
} from '@ui-kitten/components';
import AppContext from '../AppContext';
import ButtonAsync from '../components/ButtonAsync';
import ConnectValora from '../components/ConnectValora';
import background from '../assets/background.png';
import { cleanNumber, validAmount } from '../utlils';

import { contributeToBox, getBoxSummary } from '../api/box';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default ({ route, navigation }) => {
  const {
    state: { address, network },
    dispatch
  } = useContext(AppContext);

  const {
    boxAddress,
    title,
    currency,
    imageSource,
    parentScreen,
    isPublic
  } = route.params;

  const navigateBack = () => {
    navigation.goBack();
  };

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  );

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState(false);

  const dismiss = () => {
    if (parentScreen) navigation.navigate(parentScreen, { mod: Math.random() });
    else navigation.pop();
  };

  const contribute = async () => {
    if (!validAmount(amount)) {
      return;
    }

    setErrorText('');
    setLoading(true);
    try {
      await contributeToBox({
        amount: cleanNumber(amount).toString(),
        currency,
        network,
        boxAddress,
        senderAddress: address
      });

      const boxSummary = await getBoxSummary(boxAddress, network);
      dispatch({
        type: isPublic ? 'UPDATE_PUBLIC_BOX' : 'UPDATE_PERSONAL_BOX',
        data: { boxAddress, ...boxSummary }
      });

      setLoading(false);
      Alert.alert(
        `✅  You've contributed ${amount} ${currency}`,
        null,
        [{ text: 'Great!', onPress: dismiss }],
        {
          cancelable: true,
          onDismiss: dismiss
        }
      );
    } catch (error) {
      console.error(error);
      setErrorText(String(error));
      setLoading(false);
    }
  };

  const errorMessage = !errorText ? null : (
    <Card style={styles.row} status="danger">
      <Text>⛔️ Error: {errorText}</Text>
    </Card>
  );

  const contributeForm = (
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
        <View style={styles.row}>
          <Input
            style={{ flex: 1 }}
            autoFocus
            label="Amount"
            value={amount}
            accessoryRight={() => <Text>{currency}</Text>}
            onChangeText={(nextValue) => {
              setAmount(nextValue);
              setValidationError(Number.isNaN(cleanNumber(nextValue)));
            }}
            textAlign="right"
            keyboardType="numeric"
            status={validationError ? 'danger' : null}
            caption={() =>
              validationError && (
                <Text category="p2" status="danger">
                  Amount must be correct number in {currency}
                </Text>
              )
            }
          />
        </View>
        {errorMessage}
        <View style={styles.row}>
          <ButtonAsync loading={loading} onPress={contribute}>
            Send
            {validAmount(amount) ? ' ' + cleanNumber(amount) : ''} {currency}
          </ButtonAsync>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <Layout style={styles.container}>
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Contribute"
          alignment="center"
          accessoryLeft={BackAction}
        />
        <Divider />
        {address ? contributeForm : <ConnectValora />}
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
