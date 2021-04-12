import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem, Text, useTheme } from '@ui-kitten/components';
import millify from 'millify';
import * as Linking from 'expo-linking';
import { getExplorerLink } from '../api/web3';

const openExplorer = (network, address) => {
  const explorerLink = getExplorerLink(network, address);
  Linking.openURL(explorerLink);
};

export default ({ contributors, network }) => {
  const theme = useTheme();

  const renderItem = ({ contributor, amount }) => (
    <ListItem
      key={contributor}
      description={() => (
        <Text
          category="p2"
          style={{ marginLeft: 10, color: theme['color-info-500'] }}
        >
          {contributor}
        </Text>
      )}
      onPress={() => openExplorer(network, contributor)}
      accessoryRight={() => (
        <Text style={{ marginHorizontal: 8 }} category="s1">
          {millify(amount)}
        </Text>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={{ marginHorizontal: 16, marginTop: 8 }} category="h6">{`${
        contributors.length
      } ${contributors.length === 1 ? 'contributor' : 'contributors'}`}</Text>
      {contributors.map(renderItem)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 16
  }
});
