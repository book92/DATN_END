import { Image, StyleSheet, Text, View } from "react-native"
import { Button, HelperText, TextInput, Modal, Portal, DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { login, useMyContextController } from "../store";
import { useEffect, useState } from "react";
import CaptchaComponent from "../components/CaptchaComponent";

const Login = ({navigation}) => {
    const [controller, dispatch] = useMyContextController()
    const {userLogin} = controller
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [hiddenPassword, setHiddenPassword] = useState(true)
    const [captchaData, setCaptchaData] = useState({ userInput: '', captcha: { question: '', answer: 0 } })
    const [captchaError, setCaptchaError] = useState(false)
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');

    const hasErrorEmail = ()=> !email.includes("@")
    const hasErrorPassword = ()=> password.length < 6

    const showNotification = (msg) => {
        setMessage(msg);
        setVisible(true);
    };

    const hideNotification = () => setVisible(false);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            showNotification('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (captchaData.userInput === '') {
            setCaptchaError(true);
            showNotification('Vui lòng nhập kết quả CAPTCHA');
            return;
        }

        if (parseInt(captchaData.userInput) !== captchaData.captcha.answer) {
            setCaptchaError(true);
            showNotification('CAPTCHA không chính xác. Vui lòng thử lại.');
            return;
        }

        setCaptchaError(false);
        login(dispatch, email, password);
    }

    useEffect(()=> {
        console.log(userLogin)
        if(userLogin!=null)
        {
            if(userLogin.role === "admin")
                navigation.navigate("Admin")
            else if(userLogin.role === "user")
                navigation.navigate("User")
        }
    }, [userLogin])

    const righticon = <TextInput.Icon icon="eye" onPress={() => setHiddenPassword(!hiddenPassword)}/>

    const theme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            text: 'black',
        },
    };

    return(
        <PaperProvider theme={theme}>
            <View style={styles.container}>
                <Image
                    source={require('../assets/logo.png')}
                    style={{
                        alignSelf: 'center',
                        height:"20%",
                        width:"40%"
                    }}
                />
                <Text style={styles.text}>
                    Đăng Nhập
                </Text>
                <TextInput 
                    label={"Email"} 
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    theme={theme}
                />
                <HelperText type="error" visible={hasErrorEmail()} style={{textAlign:"right"}}>
                    Địa chỉ email không hợp lệ
                </HelperText>
                <TextInput
                    label={"Password"}
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input} 
                    secureTextEntry = {hiddenPassword}
                    right={righticon}
                    theme={theme}
                />
                <HelperText type="error" visible={hasErrorPassword()}>
                    Password phải có ít nhất 6 kí tự
                </HelperText>
                <CaptchaComponent onCaptchaChange={setCaptchaData} />
                <HelperText type="error" visible={captchaError}>
                    Vui lòng nhập kết quả phép tính chính xác
                </HelperText>
                <Button style={styles.button} onPress={handleLogin}>
                    <Text style={styles.textbutton}>
                        Đăng nhập
                    </Text>
                </Button>
                <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                    <Text style={{color:"#000fff",fontWeight:"bold",fontSize:14}}>Bạn chưa có tài khoản?
                    </Text>
                    <Button onPress={()=> navigation.navigate("Register")}>
                        Tạo tài khoản mới
                    </Button>
                </View>
                <Button onPress={() => navigation.navigate("ForgotPass")}>
                    Quên mật khẩu
                </Button>
                <Button style={{marginTop:0}} onPress={() => navigation.navigate("Walkthrough")}>
                    Xem hướng dẫn sử dụng
                </Button>
                <Portal>
                    <Modal visible={visible} onDismiss={hideNotification} contentContainerStyle={styles.modalContainer}>
                        <Text style={styles.modalText}>{message}</Text>
                        <Button onPress={hideNotification}>Đóng</Button>
                    </Modal>
                </Portal>
            </View>
        </PaperProvider>
    )
}

export default Login;

const styles = StyleSheet.create({
    container: {
        flex:1, 
        justifyContent:'center',
        alignItems: 'center'
    },
    text: {
        textAlign: 'center',
        fontSize:40, 
        fontWeight:'bold', 
        marginBottom: 10,
        color:"#0000CD",
    },
    input: {
        borderRadius: 10,
        width: '90%',
        margin: 5,
        borderWidth: 0.5,
        backgroundColor:"white",
        },
    button: {
        backgroundColor: "#0000CD",
        width: '80%',
        height: '7%',
        borderRadius: 10,
        justifyContent:'center',
        marginButtom: 10,
    },
    textbutton: {
        fontSize: 20,
        color: "white",
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
        alignItems: 'center',
        color:"black"
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
        color:"black"
    }
})