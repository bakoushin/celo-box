import React from 'react';
import { View, Image } from 'react-native';
import {
  TopNavigation,
  Avatar,
  Input,
  Divider,
  Icon
} from '@ui-kitten/components';
import box from '../assets/box.png';

const renderLeft = (props) => <Image {...props} source={box} />;

const SearchIcon = (props) => <Icon {...props} name="search" />;

const renderRight = (props) => (
  <View
    {...props}
    style={{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center'
    }}
  >
    <Input
      style={{
        flex: 1,
        paddingTop: 4,
        paddingHorizontal: 16
      }}
      placeholder="Search"
      accessoryLeft={SearchIcon}
      returnKeyType="search"
    />
    <Avatar
      source={{
        uri: 'https://i.pravatar.cc/300'
      }}
    />
  </View>
);

const Header = (props) => (
  <>
    <TopNavigation
      {...props}
      accessoryLeft={renderLeft}
      accessoryRight={renderRight}
    ></TopNavigation>
    <Divider />
  </>
);

export default Header;
