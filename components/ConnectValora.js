import React, { useContext, useState } from 'react';
import { View } from 'react-native';
import { Text } from '@ui-kitten/components';
import ButtonAsync from './ButtonAsync';
import AppContext from '../AppContext';
import * as Linking from 'expo-linking';
import '../global';
import { requestAccountAddress, waitForAccountAuth } from '@celo/dappkit';
import { expo } from '../app.json';

export default () => {
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(AppContext);

  const connectValora = async () => {
    setLoading(true);

    const requestId = 'request_account_address';
    const dappName = expo.name;
    const callback = Linking.makeUrl('/my/path');

    requestAccountAddress({
      requestId,
      dappName,
      callback
    });

    try {
      const { address } = await waitForAccountAuth(requestId);
      dispatch({
        type: 'SET_ADDRESS',
        address
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        style={{ margin: 16, width: 250, textAlign: 'center' }}
        category="p1"
      >
        In order to interact with boxes connect your Valora wallet.
      </Text>
      <ButtonAsync loading={loading} onPress={connectValora}>
        Connect Valora
      </ButtonAsync>
    </View>
  );
};
