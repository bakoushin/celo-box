import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Spinner } from '@ui-kitten/components';

const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size="small" status="control" />
  </View>
);

export default ({ children, loading, ...buttonProps }) => (
  <Button
    style={{ height: 50 }}
    size="large"
    accessoryLeft={loading ? LoadingIndicator : null}
    {...buttonProps}
  >
    {loading ? '' : children}
  </Button>
);

const styles = StyleSheet.create({
  indicator: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
