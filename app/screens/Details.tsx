import * as React from 'react';
import { Button, View, Text, FlatList, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { DetailsApi } from '../api/DetailsApi';
import { ListItem } from '../components/ListItem';

interface DetailsState {
  listData: any,
}

interface DetailsProps {
  navigation?: any;
}

export class Details extends React.Component<DetailsProps, DetailsState> {


  constructor(props: any) {
    super(props);
    this.state = {
      listData: [],
    }
  }

  componentDidMount() {
    //recuperation des données 
    DetailsApi.getContent().then((res) => {
      this.setState({ listData: res })
    })
  }

  renderItem = ({ item }: { item: any }) => {
    return <ListItem data={item} />
  }

  render() {

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.state.listData}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  }
});