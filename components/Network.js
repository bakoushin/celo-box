import React, { useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Button,
  ButtonGroup,
  Layout,
  Popover,
  Text,
  useTheme
} from '@ui-kitten/components';
import AppContext from '../AppContext';

export default () => {
  const theme = useTheme();

  const [popoverVisible, setPopoverVisible] = useState(false);

  const {
    state: { network },
    dispatch
  } = useContext(AppContext);

  const setNetwork = (name) => {
    if (name === network) {
      return;
    }

    dispatch({
      type: 'SET_NETWORK',
      network: name
    });
  };

  const selected = { backgroundColor: theme['color-info-200'] };

  return (
    <Popover
      backdropStyle={styles.backdrop}
      visible={popoverVisible}
      anchor={() => (
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => setPopoverVisible(true)}
        >
          <View
            style={{
              backgroundColor: theme['color-info-200'],
              paddingVertical: 4,
              paddingHorizontal: 16,
              borderRadius: 100,
              marginRight: 16
            }}
          >
            <Text status="basic">{network}</Text>
          </View>
        </TouchableOpacity>
      )}
      onBackdropPress={() => setPopoverVisible(false)}
    >
      <Layout style={styles.content}>
        <ButtonGroup style={styles.buttonGroup} status="basic">
          <Button
            style={network === 'Mainnet' ? selected : null}
            onPress={() => {
              setPopoverVisible(false);
              setNetwork('Mainnet');
            }}
          >
            Mainnet
          </Button>
          <Button
            style={network === 'Alfajores' ? selected : null}
            onPress={() => {
              setPopoverVisible(false);
              setNetwork('Alfajores');
            }}
          >
            Alfajores
          </Button>
        </ButtonGroup>
      </Layout>
    </Popover>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
});
