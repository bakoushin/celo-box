import React, { useContext, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { Button, Modal, Text, useTheme } from '@ui-kitten/components';
import * as Linking from 'expo-linking';
import Clipboard from 'expo-clipboard';
import ProgressCircle from 'react-native-progress-circle';
import millify from 'millify';
import background from '../assets/background.png';
import AppContext from '../AppContext';

const heightBySize = (size) => {
  switch (size) {
    case 'small':
      return 150;
    case 'normal':
    default:
      return 240;
  }
};

export default ({
  boxAddress,
  active,
  title,
  description,
  goal,
  balance,
  currency,
  imageSource,
  size = 'normal',
  navigation,
  parentScreen,
  isPublic
}) => {
  let slicedDescription = description;
  if (description) {
    const maxDescriptionLength = 120;
    if (description.length > maxDescriptionLength) {
      const descriptionArray = description
        .slice(0, maxDescriptionLength)
        .split(' ');
      slicedDescription =
        descriptionArray.slice(0, descriptionArray.length - 2).join(' ') +
        '...';
    }
  }

  const openContributionScreen = () => {
    navigation.navigate('Contribute', {
      boxAddress,
      title,
      imageSource,
      currency,
      parentScreen,
      isPublic
    });
  };

  const [visible, setVisible] = useState(false);

  const {
    state: { network }
  } = useContext(AppContext);

  const shareBox = () => {
    const url = Linking.createURL('box', {
      queryParams: { boxAddress, network }
    });
    Clipboard.setString(url);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  };

  const theme = useTheme();
  const percentage = Math.round((balance / goal) * 100);
  return (
    <View style={[styles.container, size === 'small' ? { height: 310 } : null]}>
      <Modal visible={visible} onBackdropPress={() => setVisible(false)}>
        <View
          style={{
            opacity: 0.77,
            backgroundColor: theme['background-alternative-color-1'],
            borderRadius: 16,
            padding: 32,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text
            appearance="alternative"
            category="h6"
            style={{ textAlign: 'center', marginBottom: 16 }}
          >
            The link was copied to the clipboard
          </Text>
          <Text appearance="alternative" style={{ textAlign: 'center' }}>
            You can share it the way you like.
          </Text>
        </View>
      </Modal>
      <ImageBackground
        source={background}
        resizeMode="cover"
        style={{
          width: '100%',
          height: heightBySize(size)
        }}
      >
        <ImageBackground
          source={imageSource}
          resizeMode="cover"
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          <View
            style={{
              position: 'absolute',
              bottom: -50,
              right: 16,
              zIndex: 100
            }}
          >
            <ProgressCircle
              percent={percentage}
              radius={50}
              borderWidth={8}
              color={theme['color-info-500']}
              shadowColor={theme['color-basic-400']}
              bgColor={theme['background-basic-color-1']}
            >
              <Text category="p1">{percentage}%</Text>
            </ProgressCircle>
          </View>
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
      </ImageBackground>
      <View
        style={{
          flex: 1,
          padding: 8
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row'
          }}
        >
          <View
            style={{
              flex: 1
            }}
          >
            <Text style={{ flex: 1, marginRight: 8 }} category="p1">
              {size === 'small' ? slicedDescription : description}
            </Text>
            {size === 'small' && (
              <View style={{ flexDirection: 'row' }}>
                <Button appearance="outline" onPress={shareBox}>
                  Share
                </Button>
              </View>
            )}
          </View>
          <View
            style={{
              width: 120,
              marginLeft: 12,
              flexDirection: 'column'
            }}
          >
            <View
              style={{
                height: 20,
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 50
              }}
            >
              <Text category="s1">{millify(balance)} </Text>
              <Text category="p1">/ {millify(goal)}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: 12
              }}
            >
              <Text category="p1">{currency}</Text>
            </View>
            {active && (
              <Button onPress={openContributionScreen}>Contribute</Button>
            )}
            {!active && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  height: size === 'small' ? 46 : 'auto'
                }}
              >
                <Text category="h6" status="success">
                  COMPLETE
                </Text>
              </View>
            )}
            {size !== 'small' && (
              <Button
                style={{ marginTop: 16 }}
                appearance="outline"
                onPress={shareBox}
              >
                Share
              </Button>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
});

// const styles = StyleSheet.create({
//   container: {
//     minHeight: 192,
//   },
// });
