import * as firebase from 'firebase';
import 'firebase/firestore';
import { Image } from 'react-native';
import { getBoxSummary } from './box';

const getImageSource = async (boxAddress) => {
  try {
    const ref = firebase.storage().ref().child(`/box_images/${boxAddress}`);
    const url = await ref.getDownloadURL();
    const cache = await Image.queryCache([url]);
    if (!Object.keys(cache).length) await Image.prefetch(url);
    return { uri: url };
  } catch (error) {
    if (error.code_ !== 'storage/object-not-found') {
      console.error(error);
    }
    return null;
  }
};

const getBoxData = async (boxAddress) => {
  const result = {
    title: '',
    description: '',
    isPublic: true
  };
  const db = firebase.firestore();
  const doc = await db.collection('boxes').doc(boxAddress).get();
  if (doc.exists) {
    const data = doc.data();
    result.title = data.title;
    result.description = data.description;
    result.isPublic = data.public;
  }
  return result;
};

const getAdditionalData = async (docs, network) => {
  const items = [];

  for (const doc of docs) {
    const boxAddress = doc.id;

    const [boxSummary, imageSource] = await Promise.all([
      getBoxSummary(boxAddress, network),
      getImageSource(boxAddress)
    ]);

    const { active, goal, balance, currency } = boxSummary;
    items.push({
      ...doc.data(),
      boxAddress,
      imageSource,
      active,
      currency,
      goal,
      balance
    });
  }

  return items;
};

const query = (isPublic = true, address = '', network) => {
  let result = firebase
    .firestore()
    .collection('boxes')
    .where('public', '==', isPublic)
    .where('network', '==', network);

  if (!isPublic) {
    result = result.where('owner', '==', address);
  }

  return result.orderBy('createdAt', 'desc');
};

const getFirstItems = async ({
  isPublic,
  cursor,
  network,
  address,
  setItems,
  setRefreshing,
  setLoading,
  setErrorMessage
}) => {
  try {
    const querySnapshot = await query(isPublic, address, network)
      .limit(20)
      .get();
    if (querySnapshot.docs.length) {
      cursor.current = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
    const items = await getAdditionalData(querySnapshot.docs, network);
    setItems(items);
    if (setLoading) {
      setLoading(false);
    }
    if (setRefreshing) {
      setRefreshing(false);
    }
  } catch (error) {
    setErrorMessage(String(error));
    console.error(error);
  }
};

const getNextItems = async ({
  isPublic,
  cursor,
  network,
  address,
  setItems,
  loadingItems,
  setLoadingItems,
  setErrorMessage
}) => {
  if (!cursor.current) {
    return;
  }
  if (loadingItems) {
    return;
  }
  setLoadingItems(true);
  try {
    const querySnapshot = await query(isPublic, address, network)
      .startAfter(cursor.current)
      .limit(20)
      .get();
    cursor.current = querySnapshot.docs[querySnapshot.docs.length - 1];
    const items = await getAdditionalData(querySnapshot.docs, network);
    setItems((prevItems) => [...prevItems, ...items]);
    setLoadingItems(false);
  } catch (error) {
    setErrorMessage(String(error));
    console.error(error);
  }
};

export { getFirstItems, getNextItems, getImageSource, getBoxData };
