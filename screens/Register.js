import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { Button, HelperText, Text, TextInput } from "react-native-paper"
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { CreateAccount, useMyContextController } from "../store";
import { Dropdown } from "react-native-paper-dropdown";

const Register = ({navigation}) =>{
    const [controller, dispatch] = useMyContextController();
    const { userLogin } = controller;
    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, SetPasswordConfirm] = useState("")
    const [hiddenPassword, setHiddenPassword] = useState(true)
    const [department, setDepartment] = useState("");
    const [departments, setDepartments] = useState([]);
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")

    const hasErrorFullname = () => fullname == ""
    const hasErrorEmail = () => !email.includes("@")
    const hasErrorPassword = () => password.length < 6
    const hasErrorPasswordConfirm = () => passwordConfirm != password
    const hasErrorPhone = () => !/^\d+$/.test(phone)  // Thêm hàm kiểm tra số điện thoại
    const righticon = <TextInput.Icon icon="eye" onPress={() => setHiddenPassword(!hiddenPassword)}/>
    
    useEffect(() => {    
        const fetchDepartments = async () => {
          try {
            const snapshot = await firestore().collection("DEPARTMENTS").get();
            const deptList = snapshot.docs.map(doc => ({
              label: doc.data().name,
              value: doc.data().name,
            }));
            setDepartments(deptList);
          } catch (error) {
            console.log("Error fetching departments: ", error);
          }
        };
        fetchDepartments();
    }, [userLogin]);

    const handleCreateAccount = () => {
        if (!fullname || !email || !password || !passwordConfirm || !department || !phone || !address) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (hasErrorFullname() || hasErrorEmail() || hasErrorPassword() || hasErrorPasswordConfirm() || hasErrorPhone()) {
            Alert.alert("Thông báo", "Vui lòng kiểm tra lại thông tin nhập vào");
            return;
        }
        CreateAccount(fullname, email, password, phone, address, department);
    }

    return(
        <ScrollView style={styles.container}>
            <View style={{alignItems:'center'}}>
                <Text style={styles.text}>
                    Tạo tài khoản mới
                </Text>
                <TextInput 
                    label={"Full Name"} 
                    style={styles.input}
                    value={fullname}
                    onChangeText={setFullname}
                    outlineColor="black"
                    textColor="black"
                />
                <HelperText type="error" visible={hasErrorFullname()} style={styles.helperText}>
                    Full Name không được phép để trống
                </HelperText>
                <TextInput 
                    label={"Email"} 
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    outlineColor="black"
                    textColor="black"
                />
                <HelperText type="error" visible={hasErrorEmail()} style={styles.helperText}>
                    Địa chỉ email không hợp lệ
                </HelperText>
                <TextInput
                    label={"Password"}
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input} 
                    secureTextEntry = {hiddenPassword}
                    right={righticon}
                    outlineColor="black"
                    textColor="black"
                />
                <HelperText type="error" visible={hasErrorPassword()} style={styles.helperText}>
                    Password phải có ít nhất 6 kí tự
                </HelperText>
                <TextInput
                    label={"Comfirm Password"}
                    value={passwordConfirm}
                    onChangeText={SetPasswordConfirm}
                    style={styles.input} 
                    secureTextEntry = {hiddenPassword}
                    right={righticon}
                    outlineColor="black"
                    textColor="black"
                />
                <HelperText type="error" visible={hasErrorPasswordConfirm()} style={styles.helperText}>
                    Password không khớp
                </HelperText>
                <TextInput 
                    label={"Address"} 
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    outlineColor="black"
                    textColor="black"
                />
                <HelperText type="error" visible={false} style={styles.helperText}>
                </HelperText>
                <TextInput
                    label={"Phone"} 
                    style={styles.input}
                    value={phone}
                    onChangeText={(text) => {
                        // Chỉ cho phép nhập số
                        if (/^\d*$/.test(text)) {
                            setPhone(text)
                        }
                    }}
                    keyboardType="numeric"
                    outlineColor="black"
                    textColor="black"
                />
                <HelperText type="error" visible={hasErrorPhone()} style={styles.helperText}>
                    Số điện thoại không hợp lệ
                </HelperText>
            </View >
            <View style={{ marginStart: 20, marginEnd: 20}}>
                <Dropdown
                    label="Chọn phòng"
                    options={departments}
                    value={department}
                    onSelect={setDepartment}
                    mode="outlined"
                    style={styles.dropdown}
                />
            </View>
            <View style={{alignItems:'center'}}>
                <Button 
                    mode="contained" 
                    style={styles.button} 
                    labelStyle={styles.buttonText}  
                    onPress={handleCreateAccount}
                >
                    Tạo tài khoản
                </Button>
            </View>
            <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                <Text style={styles.normalText}>Bạn đã có tài khoản rồi</Text>
                <Button onPress={()=> navigation.navigate("Login")} labelStyle={styles.linkText}>
                    Đăng nhập
                </Button>
            </View>
        </ScrollView>
    )
}
export default Register
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Thêm màu nền trắng
    },
    text: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: "#0000CD",
        marginTop: 10,
    },
    input: {
        borderRadius: 10,
        width: '90%',
        marginTop: 5,
        borderWidth: 0.5,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#0000CD",
        width: '90%',
        borderRadius: 10,
        justifyContent: 'center',
        marginTop: 5,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
    },
    helperText: {
        color: 'red',
    },
    normalText: {
        color: 'black',
    },
    linkText: {
        color: '#0000CD',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderColor: 'black',
    },
});
