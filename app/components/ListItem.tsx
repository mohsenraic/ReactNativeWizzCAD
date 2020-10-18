import * as React from 'react';
import { Button, View, Text, FlatList, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { DetailsApi } from '../api/DetailsApi';

interface ItemState {
}

interface ItemProps {
  data?: any;
}

export class ListItem extends React.Component<ItemProps, ItemState> {


  constructor(props: any) {
    super(props);
  }
  render() {
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{this.props.data.name}</Text>
        <Text style={styles.description}>Model du formulaire : {this.props.data.forms[0].model.name}</Text>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    backgroundColor: '#faf7a7',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 25
  },
  title: {
    fontSize: 20,
  },

  description: {
    fontSize: 13,
  },
});