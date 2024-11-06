import { ScrollView, StyleSheet, View } from "react-native"
import { Button, Divider, Text } from "react-native-paper"

const Walkthrough = ({navigation}) => {
    return (
        <ScrollView style={styles.container}>
          <Text style={styles.title}>
            Hướng dẫn sử dụng
          </Text>
          <Text style={styles.heading}>
            Tài khoản/Đăng nhập và Đăng ký
          </Text>
          <Text style={styles.subheading}>Trong trường hợp đã có tài khoản:</Text>
          <Text style={styles.content}>
            - Sử dụng tài khoản đã có đó để đăng nhập vào hệ thống.
          </Text>
          <Text style={styles.subheading}>Trong trường hợp chưa có tài khoản:</Text>
          <Text style={styles.content}>
            - Bước 1: Đến trang Đăng ký để tạo tài khoản mới.{'\n'}
            - Bước 2: Sử dụng tài khoản vừa tạo để đăng nhập vào hệ thống.
          </Text>
          <Divider />
          <Text style={styles.heading}>
            Sử dụng ứng dụng - Đối với User
          </Text>
          <Text style={styles.content}>
            - Trang chủ sẽ hiện danh sách các thiết bị của người dùng đang sử dụng.{'\n'}
            - Chọn vào thiết bị cụ thể để xem chi tiết của thiết bị đó.{'\n'}
            - Nếu như thiết bị đang sử dụng bị lỗi, có thể chọn nút báo lỗi trong trang chi tiết thiết bị để báo cáo lỗi đến Admin.{'\n'}
            - Khi chọn nút báo lỗi sẽ dẫn đến trang Báo lỗi. Ở đây người dùng mô tả lỗi đang bị sau đó chọn gửi để gửi thông tin báo lỗi đến Admin.{'\n'}
            - Sau khi Admin nhận được lỗi sẽ cho người đến để sửa lỗi.
          </Text>
          <Divider />
          <Text style={[styles.heading, {marginTop: 30}]}>
            Thông tin liên lạc:
          </Text>
          <Text style={styles.content}>
            Admin: Vương Minh Chánh{'\n'}
            phone: 0866787160 -- email: vuongminhchanh92@gmail.com{'\n'}
            {'\n'}
            Kỹ thuật: Vương Minh Chánh{'\n'}
            phone: 0971089597 -- email: vuongminhchanh123@gmail.com
          </Text>
          <Divider/>
          <Button 
            mode="contained" 
            style={styles.button} 
            labelStyle={styles.buttonText}
            onPress={() => navigation.navigate("Login")}
          >
            Trở về
          </Button>
          <Divider/>
          <Text style={styles.footer}>
            App được thực hiện bởi: Vương Minh Chánh{'\n'}
            Liên hệ: 0866787160 - vuongminhchanh92@gmail.com
          </Text>
        </ScrollView>
      );
    };

export default Walkthrough;

const styles = StyleSheet.create({
    container: {
      margin: 16,
    },
    title: {
      textAlign: 'center',
      marginBottom: 20,
      fontSize: 30,
      color: '#0000CD',
      fontWeight: 'bold'
    },
    heading: {
      fontSize: 20,
      color: 'black',
      fontWeight: 'bold'
    },
    subheading: {
      fontSize: 18,
      color: 'black',
      fontWeight: 'bold'
    },
    content: {
      fontSize: 15,
      color: 'black'
    },
    button: {
      width: "90%",
      borderRadius: 10,
      margin: 20,
      backgroundColor: "#0000CD",
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold'
    },
    footer: {
      marginVertical: 10,
      marginBottom: 10,
      color: 'black'
    }
})