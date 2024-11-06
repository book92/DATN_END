import {Alert, StyleSheet, View} from 'react-native';
import {Button, Text, TextInput, DefaultTheme} from 'react-native-paper';
import React from 'react';
import auth from '@react-native-firebase/auth';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: 'black',
    primary: 'black',
  },
};

const ForgotPass = ({navigation}) => {
  const [email, setEmail] = React.useState('');
  const handlResetPass = () => {
    auth()
      .sendPasswordResetEmail(email)
      .then(() => Alert.alert('Đã gửi email'))
      .catch(e => Alert.alert(e.message));
  };
  return (
    <View style={styles.container}>
      <Text style={styles.headerName}>Quên Mật Khẩu</Text>
      <View style={{height: 40, marginBottom: 10}}>
        <TextInput
          style={styles.textInput}
          label={'Email'}
          value={email}
          onChangeText={setEmail}
          underlineColor="transparent"
          mode="outlined"
          outlineColor="black"
          activeOutlineColor="black"
          theme={theme}
        />
      </View>
      <Button style={styles.button} mode="contained" onPress={handlResetPass}>
        Gửi Email
      </Button>
      <Button 
        style={styles.button} 
        mode="contained" 
        onPress={() => navigation.navigate('Login')}
      >
        Trở về
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#E1E0FF',
    padding: 30,
  },
  headerName: {
    alignSelf: 'center',
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  textInput: {
    backgroundColor: '#fff',
    color: 'black',
  },
  button: {
    borderRadius: 8,
    marginTop: 20,
    padding: 5,
    backgroundColor: '#507FF9',
  },
});

export default ForgotPass;