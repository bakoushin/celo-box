import React, { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { Button, Card, Icon, Spinner, useTheme } from '@ui-kitten/components';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const CameraIcon = (props) => <Icon {...props} name="camera-outline" />;
const ImageIcon = (props) => <Icon {...props} name="image-outline" />;
const TrashIcon = (props) => <Icon {...props} name="trash-outline" />;

const resizeImage = async (image) => {
  return ImageManipulator.manipulateAsync(
    image.localUri || image.uri,
    [{ resize: { width: 600 } }],
    { compress: 0, format: ImageManipulator.SaveFormat.JPEG }
  );
};

export default ({ image, setImage }) => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    setLoading(true);

    const pickerResult = await ImagePicker.launchImageLibraryAsync();

    if (!pickerResult.cancelled) {
      const image = await resizeImage(pickerResult);
      setImage(image);
    }

    setLoading(false);
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }

    setLoading(true);

    const pickerResult = await ImagePicker.launchCameraAsync();

    if (!pickerResult.cancelled) {
      const image = await resizeImage(pickerResult);
      setImage(image);
    }

    setLoading(false);
  };

  const deleteImage = () => {
    setImage(null);
  };

  const SelectedImage = ({ image }) => (
    <View
      style={{
        width: '100%',
        height: 225
      }}
    >
      <Image
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 3
        }}
        source={image}
        resizeMode="cover"
      />
      <Button
        style={{ position: 'absolute', right: 8, top: 8, width: 50 }}
        accessoryLeft={TrashIcon}
        onPress={deleteImage}
      />
    </View>
  );

  const EmptyImage = () => (
    <Card
      style={{
        width: '100%',
        height: 225,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme['background-basic-color-3'],
        borderColor: theme['border-basic-color-4']
      }}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Button
            style={styles.button}
            onPress={pickImage}
            accessoryLeft={ImageIcon}
            appearance="outline"
          >
            Add from library
          </Button>
          <Button
            style={styles.button}
            onPress={takePhoto}
            accessoryLeft={CameraIcon}
            appearance="outline"
          >
            Take photo
          </Button>
        </>
      )}
    </Card>
  );

  return image ? <SelectedImage image={image} /> : <EmptyImage />;
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8
  }
});
