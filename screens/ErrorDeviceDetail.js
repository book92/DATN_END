import React from "react";
import { StyleSheet, Text, View, ScrollView, Alert } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import firestore from '@react-native-firebase/firestore';

const BLUE_COLOR = '#0000CD';
const ErrorDeviceDetail = ({ route, navigation }) => {
    const { item } = route.params;
    const [description, setDescription] = React.useState(item.description);
    const [userreport, setUserreport] = React.useState(item.userreport);

    const handleUpdate = async () => {
        try {    
            await firestore().collection("ERROR").doc(item.id).update({
                state: "Đã sửa",
                fixday: new Date().toString(),
            });
            Alert.alert("Cập nhật thành công!");
            navigation.goBack();
        } catch (error) {
            console.error("Error updating error device: ", error);
            Alert.alert("Có lỗi xảy ra khi cập nhật!");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Danh sách thiết bị lỗi</Text>
            <View style={styles.inputContainer}>
                {renderInput("Tên thiết bị", item.deviceName, true)}
                {renderInput("Người báo lỗi", userreport, true)}
                {renderInput("Ngày báo", item.reportday, true)}
                {renderInput("Ngày sửa", item.fixday, true)}
                {renderInput("Tình trạng", item.state, true)}
                <Text style={{marginBottom:5, fontSize:18, color:"blue",fontWeight: 'bold',}}>Mô tả</Text>
                <TextInput
                    style={[styles.inputmota, { borderColor: '#4169E1',marginVertical: 5, borderWidth: 1, borderRadius: 5 }]}
                    multiline
                    value={description}
                    onChangeText={setDescription}
                    editable={false}
                    backgroundColor="white"
                    textColor="black"
                />
                <View style={styles.buttonContainer}>
                    <Button mode="contained" onPress={handleUpdate} style={styles.button} labelStyle={styles.buttonLabel}>
                        Cập nhật
                    </Button>
                    <Button mode="contained" onPress={() => navigation.goBack()} style={[styles.button, styles.cancelButton]} labelStyle={styles.buttonLabel}>
                        Trở về
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
};

const renderInput = (label, value, editable, multiline = false) => (
    <>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, multiline && styles.multilineInput]}
            value={value}
            editable={false}
            multiline={multiline}
            textColor="black"
        />
    </>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "white",
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: "center",
        color: 'black',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        color: 'blue',
    },
    input: {
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#4169E1',  // Royal Blue
        borderRadius: 5,
        marginVertical: 5,
        backgroundColor: '#FFFFFF',  // Change background to white
    },
    multilineInput: {
        height: 100,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: '#0000FF',  // Blue
    },
    cancelButton: {
        backgroundColor: '#FF0000',  // Red
    },
    buttonLabel: {
        color: 'white',  // Set button text color to white
    },
});

export default ErrorDeviceDetail;