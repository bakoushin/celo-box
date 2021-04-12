import React, { useContext, useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Button,
  Card,
  Divider,
  Icon,
  Layout,
  Text,
  Spinner,
  TopNavigation,
  TopNavigationAction,
  useTheme
} from '@ui-kitten/components';
import millify from 'millify';
import BoxCard from '../components/Card';
import Contributors from '../components/Contributors';
import AppContext from '../AppContext';
import ConnectValora from '../components/ConnectValora';
import { getBoxSummary, getContributors } from '../api/box';
import { getBoxData, getImageSource } from '../api/database';
import * as Linking from 'expo-linking';
import { getExplorerLink } from '../api/web3';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

const Loader = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Spinner />
  </View>
);

const openExplorer = (network, address) => {
  const explorerLink = getExplorerLink(network, address);
  Linking.openURL(explorerLink);
};

export default ({ route, navigation }) => {
  const {
    state: { address, network }
  } = useContext(AppContext);

  const { boxAddress } = route.params;
  const { name: parentScreen } = route;

  const theme = useTheme();

  const navigateBack = () => {
    navigation.goBack();
  };

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [active, setActive] = useState(false);
  const [complete, setComplete] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [goal, setGoal] = useState('0');
  const [balance, setBalance] = useState('0');
  const [currency, setCurrency] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [contributors, setContributors] = useState([]);
  const [imageSource, setImageSource] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const getBoxInformation = async () => {
    setErrorMessage('');
    try {
      const [
        boxSummary,
        _contributors,
        boxData,
        _imageSource
      ] = await Promise.all([
        getBoxSummary(boxAddress, network),
        getContributors(boxAddress, network),
        getBoxData(boxAddress),
        getImageSource(boxAddress)
      ]);

      // On-chain data
      const {
        active: _active,
        complete: _complete,
        finalized: _finalized,
        goal: _goal,
        balance: _balance,
        currency: _currency,
        ownerAddress: _ownerAddress,
        receiverAddress: _receiverAddress
      } = boxSummary;
      setGoal(_goal);
      setBalance(_balance);
      setActive(_active);
      setFinalized(_finalized);
      setComplete(_complete);
      setCurrency(_currency);
      setOwnerAddress(_ownerAddress);
      setReceiverAddress(_receiverAddress);
      setContributors(_contributors);

      // Off-chain data
      const {
        title: _title,
        description: _description,
        isPublic: _isPublic
      } = boxData;
      setTitle(_title);
      setDescription(_description);
      setIsPublic(_isPublic);

      // Image
      setImageSource(_imageSource);
      setLoading(false);
    } catch (error) {
      setErrorMessage(String(error));
      console.error(error);
    }
  };

  useEffect(() => {
    if (route.params.mod) setLoading(true);
    getBoxInformation();
  }, [route.params.mod]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getBoxInformation();
    setRefreshing(false);
  };

  const findContributor = ({ contributor }) =>
    parseInt(contributor) === parseInt(address);
  const contribution = contributors.find(findContributor);
  const contributionAmount = (contribution && contribution.amount) || 0;
  const canRevoke = !finalized && contributionAmount > 0;

  const Revocation = () =>
    contributionAmount > 0 && (
      <>
        <Divider style={{ marginVertical: 8 }} />
        <View
          style={{
            flexDirection: 'row',
            margin: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ flex: 1, margin: 8 }}>
            You have contributed{' '}
            <Text category="s1">{millify(contributionAmount)}</Text> {currency}
          </Text>
          {canRevoke && (
            <Button
              status="danger"
              appearance="outline"
              size="medium"
              style={{ height: 42, width: 120 }}
              onPress={() =>
                navigation.navigate('RevokeContribution', {
                  boxAddress,
                  title,
                  contributorAddress: address,
                  balance,
                  currency,
                  imageSource,
                  parentScreen,
                  isPublic
                })
              }
            >
              Revoke
            </Button>
          )}
        </View>
      </>
    );

  const isOwner = parseInt(address) === parseInt(ownerAddress);
  const isReceiver = parseInt(address) === parseInt(receiverAddress);
  const canFinalize = !finalized && complete && (isOwner || isReceiver);

  const Finalization = () =>
    canFinalize && (
      <>
        <Divider style={{ marginVertical: 8 }} />
        <View
          style={{
            flex: 1,
            margin: 8,
            marginBottom: 24,
            alignItems: 'center'
          }}
        >
          <Text style={{ flex: 1, margin: 8 }} category="h3">
            🎉
          </Text>
          <Text style={{ flex: 1, margin: 8 }} category="h6">
            The goal is reached!
          </Text>

          {isReceiver && (
            <Button
              status="success"
              onPress={() =>
                navigation.navigate('Redeem', {
                  boxAddress,
                  title,
                  receiverAddress,
                  balance,
                  currency,
                  imageSource,
                  parentScreen,
                  isPublic
                })
              }
            >
              Redeem money
            </Button>
          )}

          {isOwner && !isReceiver && (
            <Button
              status="success"
              onPress={() =>
                navigation.navigate('Finalize', {
                  boxAddress,
                  title,
                  receiverAddress,
                  balance,
                  currency,
                  imageSource,
                  parentScreen,
                  isPublic
                })
              }
            >
              Send money to the receiver
            </Button>
          )}
        </View>
      </>
    );

  const Error = () =>
    !!errorMessage && (
      <Card style={styles.row} status="danger">
        <Text>⛔️ Error: {errorMessage}</Text>
      </Card>
    );

  const Connect = () =>
    !address && (
      <View style={{ flex: 1, marginBottom: 16 }}>
        <Divider style={{ marginVertical: 8 }} />
        <ConnectValora />
      </View>
    );

  const Creator = () => (
    <>
      <View style={[styles.container, { paddingBottom: 16 }]}>
        <Text style={{ marginHorizontal: 16, marginVertical: 8 }} category="h6">
          Creator
        </Text>
        {isOwner ? (
          <Text style={{ marginHorizontal: 16 }} category="p2">
            You have created this box
          </Text>
        ) : (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => openExplorer(network, ownerAddress)}
          >
            <Text
              style={{
                marginHorizontal: 16,
                color: theme['color-info-500']
              }}
              category="p2"
            >
              {ownerAddress}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Divider />
    </>
  );

  const ownerIsReceiver = parseInt(ownerAddress) === parseInt(receiverAddress);

  const Receiver = () => (
    <>
      <View style={[styles.container, { paddingBottom: 4 }]}>
        <Text style={{ marginHorizontal: 16, marginVertical: 8 }} category="h6">
          Receiver
        </Text>
        {!isReceiver && !ownerIsReceiver && (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => openExplorer(network, receiverAddress)}
          >
            <Text
              style={{
                marginHorizontal: 16,
                marginBottom: 16,
                color: theme['color-info-500']
              }}
              category="p2"
            >
              {receiverAddress}
            </Text>
          </TouchableOpacity>
        )}

        {isReceiver ? (
          <Text
            style={{ marginHorizontal: 16, marginBottom: 16 }}
            category="p2"
          >
            You will receive this box
          </Text>
        ) : ownerIsReceiver ? (
          <Text
            style={{ marginHorizontal: 16, marginBottom: 16 }}
            category="p2"
          >
            Creator will receive this box
          </Text>
        ) : null}
        <Divider />
      </View>
    </>
  );

  const Main = () => (
    <>
      <Error />
      <BoxCard
        boxAddress={boxAddress}
        active={active}
        title={title}
        description={description}
        goal={goal}
        balance={balance}
        currency={currency}
        imageSource={imageSource}
        navigation={navigation}
        parentScreen={parentScreen}
        isPublic={isPublic}
      />
      <Connect />
      <Finalization />
      <Revocation />
      <Divider style={{ marginVertical: 8 }} />
      <Creator />
      <Receiver />
      <Contributors contributors={contributors} network={network} />
    </>
  );

  return (
    <Layout style={styles.container}>
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Box Details"
          alignment="center"
          accessoryLeft={BackAction}
        />
        <Divider />
        {loading && <Loader />}
        {!loading && (
          <ScrollView
            style={styles.container}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Main />
          </ScrollView>
        )}
      </SafeAreaView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
