import React, { useState } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { TextInput, HelperText, Button, Text } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const BLUE_COLOR = '#0000CD';

const ChangePassword = () => {
  const [currentPass, setCurrentPass] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hiddenPassword, setHiddenPassword] = useState(true);
  const navigation = useNavigation();

  const hasErrorPass = () => password.length < 6;
  const hasErrorConfirmPass = () => password !== confirmPassword;

  const rightIcon = <TextInput.Icon icon={hiddenPassword ? "eye-off" : "eye"} onPress={() => setHiddenPassword(!hiddenPassword)} />;

  const reauthenticate = () => {
    const user = auth().currentUser;
    const credential = auth.EmailAuthProvider.credential(user.email, currentPass);
    return user.reauthenticateWithCredential(credential);
  };
  
  const handleChangePassword = async () => {
    if (hasErrorPass() || hasErrorConfirmPass()) {
      Alert.alert('Thông báo', 'Vui lòng kiểm tra lại thông tin nhập vào');
      return;
    }

    try {
      const user = auth().currentUser;
      
      if (!user) {
        Alert.alert('Lỗi', 'Người dùng hiện tại không tồn tại');
        return;
      }
      await reauthenticate();
      await user.updatePassword(password);
      await firestore().collection('USERS').doc(user.email).update({password: password});
      Alert.alert('Thành công', 'Cập nhật mật khẩu thành công, vui lòng đăng nhập lại');
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert('Thông báo', 'Đổi mật khẩu thất bại');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={{alignItems: 'center'}}>
        <Text style={styles.text}>Đổi mật khẩu</Text>
        <TextInput
          label="Mật khẩu hiện tại"
          style={styles.input}
          value={currentPass}
          onChangeText={setCurrentPass}
          secureTextEntry={hiddenPassword}
          right={rightIcon}
          outlineColor={BLUE_COLOR}
          theme={{ colors: { primary: BLUE_COLOR } }}
          textColor="black"
        />
        <TextInput
          label="Mật khẩu mới"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={hiddenPassword}
          right={rightIcon}
          outlineColor={BLUE_COLOR}
          theme={{ colors: { primary: BLUE_COLOR } }}
          textColor="black"
        />
        <HelperText type="error" visible={hasErrorPass()} style={styles.helperText}>
          Mật khẩu mới phải có ít nhất 6 kí tự
        </HelperText>
        <TextInput
          label="Xác nhận mật khẩu mới"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={hiddenPassword}
          right={rightIcon}
          outlineColor={BLUE_COLOR}
          theme={{ colors: { primary: BLUE_COLOR } }}
          textColor="black"
        />
        <HelperText type="error" visible={hasErrorConfirmPass()} style={styles.helperText}>
          Mật khẩu xác nhận không khớp
        </HelperText>
        <Button 
          mode="contained" 
          style={styles.button} 
          labelStyle={styles.buttonText}  
          onPress={handleChangePassword}
        >
          Đổi mật khẩu
        </Button>
        <Button 
          mode="outlined" 
          style={styles.returnButton} 
          labelStyle={styles.returnButtonText}  
          onPress={() => navigation.goBack()}
        >
          Trở về
        </Button>
      </View>
    </ScrollView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: BLUE_COLOR,
    marginTop: 10,
    marginBottom: 20,
  },
  input: {
    borderRadius: 10,
    width: '90%',
    marginTop: 5,
    borderWidth: 1,
    backgroundColor: "#fff",
    borderColor: BLUE_COLOR,
  },
  button: {
    backgroundColor: BLUE_COLOR,
    width: '90%',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  helperText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },
  returnButton: {
    width: '90%',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 10,
    borderColor: BLUE_COLOR,
  },
  returnButtonText: {
    color: BLUE_COLOR,
    fontSize: 16,
  },
});
