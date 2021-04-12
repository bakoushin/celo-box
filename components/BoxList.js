import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Button, Layout, Spinner, Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import AppContext from '../AppContext';
import Card from '../components/Card';
import ConnectValora from '../components/ConnectValora';
import { getFirstItems, getNextItems } from '../api/database';

export default ({ isPublic }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  // const [items, setItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const cursor = useRef(null);

  const {
    state: { publicBoxes, personalBoxes, address, network },
    dispatch
  } = useContext(AppContext);

  const navigation = useNavigation();

  const items = isPublic ? publicBoxes : personalBoxes;
  const setItems = (data) => {
    if (typeof data === 'function') {
      data = data(items);
    }
    dispatch({
      type: isPublic ? 'SET_PUBLIC_BOXES' : 'SET_PERSONAL_BOXES',
      items: data
    });
  };

  useEffect(() => {
    if (!isPublic && !address) return;

    setLoading(true);
    getFirstItems({
      isPublic,
      address,
      network,
      cursor,
      setItems,
      setErrorMessage,
      setLoading
    });
  }, [address, network]);

  const loadFirst = () => {
    setRefreshing(true);
    getFirstItems({
      isPublic,
      address,
      network,
      cursor,
      setItems,
      setRefreshing,
      setErrorMessage
    });
  };

  const loadMore = () => {
    getNextItems({
      isPublic,
      address,
      network,
      cursor,
      setItems,
      loadingItems,
      setLoadingItems,
      setErrorMessage
    });
  };

  const error = () =>
    !!errorMessage && (
      <Card style={styles.row} status="danger">
        <Text>⛔️ Error: {errorMessage}</Text>
      </Card>
    );

  const loadingSpinner = () =>
    !!loadingItems && (
      <View style={{ flex: 1, margin: 8, alignItems: 'center' }}>
        <Spinner />
      </View>
    );

  const createBox = () => navigation.navigate('BoxEditor', { isPublic });

  if (!isPublic && !address) {
    return <ConnectValora />;
  }

  if (loading) {
    return (
      <Layout style={styles.container}>
        <Spinner />
      </Layout>
    );
  }

  if (!items.length) {
    return (
      <Layout style={styles.container}>
        <Text style={{ padding: 16 }} category="p1">
          {isPublic
            ? 'Be the first one to create a public box!'
            : 'Create your first personal box'}
        </Text>
        <Button appearance="outline" onPress={createBox}>
          {isPublic ? 'Create public box' : 'Create personal box'}
        </Button>
        {!isPublic && (
          <View style={{ padding: 16 }}>
            <Text category="p2" appearance="hint">
              It will not appear in public list
            </Text>
          </View>
        )}
      </Layout>
    );
  }

  const Item = ({
    boxAddress,
    active,
    title,
    description,
    goal,
    balance,
    currency,
    imageSource
  }) => (
    <TouchableWithoutFeedback
      onPress={() => navigation.navigate('BoxView', { boxAddress })}
    >
      <View style={styles.item}>
        <Card
          size="small"
          active={active}
          boxAddress={boxAddress}
          title={title}
          description={description}
          imageSource={imageSource}
          goal={goal}
          balance={balance}
          navigation={navigation}
          currency={currency}
          imageSource={imageSource}
          isPublic={isPublic}
        />
      </View>
    </TouchableWithoutFeedback>
  );

  const renderItem = ({ item }) => <Item {...item} />;

  const ITEM_HEIGHT = 310;
  const getItemLayout = (_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index
  });

  return (
    <Layout style={{ flex: 1 }}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.boxAddress}
        getItemLayout={getItemLayout}
        refreshing={refreshing}
        onRefresh={loadFirst}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={10}
        onEndReached={loadMore}
        ListFooterComponent={error ? error : loadingSpinner}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  item: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden'
  }
});
