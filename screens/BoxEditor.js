import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  Alert
} from 'react-native';
import {
  Card,
  CheckBox,
  Divider,
  IndexPath,
  Icon,
  Input,
  Layout,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme
} from '@ui-kitten/components';
import DimissKeyboard from '../components/DimissKeyboard';
import AppContext from '../AppContext';
import ConnectValora from '../components/ConnectValora';
import CoverImageEditor from '../components/CoverImageEditor';
import ButtonAsync from '../components/ButtonAsync';
import { cleanNumber } from '../utlils';
import { getWeb3 } from '../api/web3';

import { createBoxOnChain, getBoxSummary } from '../api/box';
import * as firebase from 'firebase';
import 'firebase/firestore';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default ({ route, navigation }) => {
  const theme = useTheme();

  const navigateBack = () => {
    navigation.goBack();
  };

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  );

  const {
    state: { address, network },
    dispatch
  } = useContext(AppContext);

  const web3 = getWeb3(network);

  const { isPublic } = route.params;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [coverImage, setCoverImage] = React.useState(null);

  const [title, setTitle] = useState('');
  const [titleRequiredWarning, setTitleRequiredWarning] = useState(false);
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [goalValidationError, setGoalValidationError] = useState(false);
  const [goalRequiredWarning, setGoalRequiredWarning] = useState(false);
  const [limitMinimalContribution, setLimitMinimalContribution] = useState(
    false
  );
  const [minimalContribution, setMinimalContribution] = useState('');
  const [
    minimalContributionValidationError,
    setMinimalContributionValidationError
  ] = useState(false);
  const [
    minimalContributionRequiredWarning,
    setMinimalContributionRequiredWarning
  ] = useState(false);

  const [currencyIndex, setCurrencyIndex] = useState(new IndexPath(0));
  const currecies = ['cUSD', 'CELO'];
  const currency = currecies[currencyIndex.row];

  const [receiverIndex, setReceiverIndex] = useState(0);

  const [receiverAddress, setReceiverAddress] = useState('');
  const [
    receiverAddressValidationError,
    setReceiverAddressValidationError
  ] = useState(false);
  const [
    receiverAddressRequiredWarning,
    setReceiverAddressRequiredWarning
  ] = useState(false);

  const createBox = async () => {
    let stop = false;
    if (!title) {
      setTitleRequiredWarning(true);
      stop = true;
    }
    if (!goal) {
      setGoalRequiredWarning(true);
      stop = true;
    }
    if (limitMinimalContribution && !minimalContribution) {
      setMinimalContributionRequiredWarning(true);
      stop = true;
    }
    if (receiverIndex !== 0 && !receiverAddress) {
      setReceiverAddressRequiredWarning(true);
      stop = true;
    }
    if (stop) {
      Alert.alert('Please fill required fields');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const boxAddress = await createBoxOnChain({
        network,
        currency,
        goal: cleanNumber(goal).toString(),
        minimalContribution: cleanNumber(minimalContribution).toString(),
        ownerAddress: address,
        receiverAddress: receiverIndex !== 0 ? receiverAddress : address
      });

      const db = firebase.firestore();
      await db.collection('boxes').doc(boxAddress).set({
        network,
        title,
        description,
        public: isPublic,
        owner: address,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      let imageSource = null;
      if (coverImage) {
        const ref = firebase.storage().ref().child(`/box_images/${boxAddress}`);
        const response = await fetch(coverImage.uri);
        const blob = await response.blob();
        const snapshot = await ref.put(blob);
        const url = await ref.getDownloadURL();
        imageSource = { uri: url };
        blob.close();
      }

      const boxSummary = await getBoxSummary(boxAddress, network);
      dispatch({
        type: isPublic ? 'ADD_PUBLIC_BOX' : 'ADD_PERSONAL_BOX',
        data: {
          boxAddress,
          title,
          description,
          isPublic,
          imageSource,
          ...boxSummary
        }
      });

      setLoading(false);
      navigation.pop();
      navigation.push('BoxView', { boxAddress });
    } catch (error) {
      setLoading(false);
      setErrorMessage(String(error));
      console.error(error);
    }
  };

  const Error = () =>
    !!errorMessage && (
      <Card style={styles.row} status="danger">
        <Text>⛔️ Error: {errorMessage}</Text>
      </Card>
    );

  const createBoxForm = (
    <DimissKeyboard>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <CoverImageEditor image={coverImage} setImage={setCoverImage} />
        <Input
          style={styles.row}
          label="Title"
          placeholder="What's the goal of the box?"
          value={title}
          onChangeText={(nextValue) => {
            if (!!nextValue) setTitleRequiredWarning(false);
            setTitle(nextValue);
          }}
          maxLength={50}
          status={titleRequiredWarning ? 'danger' : null}
          caption={titleRequiredWarning ? 'Required' : 'Max. 50 characthers'}
        />
        <Input
          style={styles.row}
          label="Description"
          placeholder="Details about the box"
          maxLength={400}
          caption="Max. 400 characters"
          multiline={true}
          textStyle={{ minHeight: 64 }}
          value={description}
          onChangeText={(nextValue) => setDescription(nextValue)}
        />
        <View style={styles.row}>
          <View style={{ flexDirection: 'row' }}>
            <Input
              style={{ flex: 1 }}
              label="Goal"
              value={goal}
              onChangeText={(nextValue) => {
                setGoal(nextValue);
                setGoalValidationError(Number.isNaN(cleanNumber(nextValue)));
                if (!!nextValue) setGoalRequiredWarning(false);
              }}
              textAlign="right"
              keyboardType="numeric"
              status={
                goalValidationError || goalRequiredWarning ? 'danger' : null
              }
              caption={() =>
                (goalRequiredWarning && (
                  <Text category="p2" status="danger">
                    Required
                  </Text>
                )) ||
                (goalValidationError && (
                  <Text category="p2" status="danger">
                    Goal amount must be correct number in {currency}
                  </Text>
                ))
              }
            />
            <Select
              label="Currency"
              style={{ width: 115, marginLeft: 8 }}
              selectedIndex={currencyIndex}
              onSelect={(index) => setCurrencyIndex(index)}
              value={currency}
            >
              {currecies.map((title) => (
                <SelectItem key={title} title={title} />
              ))}
            </Select>
          </View>
        </View>
        <View style={styles.row}>
          <CheckBox
            checked={limitMinimalContribution}
            onChange={(nextChecked) => {
              setLimitMinimalContribution(nextChecked);
              if (!nextChecked) {
                setMinimalContribution('');
                setMinimalContributionValidationError(false);
                setMinimalContributionRequiredWarning(false);
              }
            }}
          >
            <Text>Limit minimal contribution</Text>
          </CheckBox>
        </View>
        {limitMinimalContribution && (
          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Input
                style={{ flex: 1 }}
                label="Minimal contribution"
                value={minimalContribution}
                onChangeText={(nextValue) => {
                  setMinimalContribution(nextValue);
                  setMinimalContributionValidationError(
                    Number.isNaN(cleanNumber(nextValue))
                  );
                  if (!!nextValue) setMinimalContributionRequiredWarning(false);
                }}
                textAlign="right"
                keyboardType="numeric"
                status={
                  minimalContributionValidationError ||
                  minimalContributionRequiredWarning
                    ? 'danger'
                    : null
                }
                caption={() =>
                  (minimalContributionRequiredWarning && (
                    <Text category="p2" status="danger">
                      Required
                    </Text>
                  )) ||
                  (minimalContributionValidationError && (
                    <Text category="p2" status="danger">
                      Goal amount must be correct number in {currency}
                    </Text>
                  ))
                }
              />
              <Text
                style={{
                  width: 115,
                  marginLeft: 8,
                  marginTop: 30
                }}
                category="s1"
              >
                {currency}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.row}>
          <Text
            style={{
              color: theme['color-basic-600'],
              fontWeight: '800',
              fontSize: 12
            }}
          >
            Receiver
          </Text>
          <RadioGroup
            selectedIndex={receiverIndex}
            onChange={(index) => {
              setReceiverIndex(index);
              if (index === 0) {
                setReceiverAddress('');
                setReceiverAddressValidationError(false);
                setReceiverAddressRequiredWarning(false);
              }
            }}
          >
            <Radio checked>Me (creator of the box)</Radio>
            <Radio>Another address</Radio>
          </RadioGroup>
        </View>
        {receiverIndex !== 0 && (
          <Input
            style={styles.row}
            label="Receiver address"
            value={receiverAddress}
            onChangeText={(nextValue) => {
              setReceiverAddress(nextValue);
              setReceiverAddressValidationError(
                !!nextValue && !web3.utils.isAddress(nextValue)
              );
              if (!!nextValue) setReceiverAddressRequiredWarning(false);
            }}
            status={
              receiverAddressValidationError || receiverAddressRequiredWarning
                ? 'danger'
                : null
            }
            caption={() =>
              (receiverAddressRequiredWarning && (
                <Text category="p2" status="danger">
                  Required
                </Text>
              )) ||
              (receiverAddressValidationError && (
                <Text category="p2" status="danger">
                  Must be a valid Celo address
                </Text>
              ))
            }
          />
        )}
        <View style={styles.row}>
          <Error />
        </View>
        <View style={styles.row}>
          <ButtonAsync loading={loading} onPress={createBox}>
            {`Create ${isPublic ? 'public' : 'personal'} box`}
          </ButtonAsync>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </DimissKeyboard>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Layout style={styles.container}>
        <SafeAreaView style={styles.container}>
          <TopNavigation
            title={`Create ${isPublic ? 'public' : 'personal'} box`}
            alignment="center"
            accessoryLeft={BackAction}
          />
          <Divider />
          {address ? createBoxForm : <ConnectValora />}
        </SafeAreaView>
      </Layout>
    </KeyboardAvoidingView>
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
