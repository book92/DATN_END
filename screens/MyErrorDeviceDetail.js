import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { TextInput, Button } from "react-native-paper";
import firestore from '@react-native-firebase/firestore';
import { useMyContextController } from '../store';

const BLUE_COLOR = '#0000CD';

const MyErrorDeviceDetail = ({ route, navigation }) => {
    const { item } = route.params;
    const [description, setDescription] = React.useState('');
    const [userreport, setUserreport] = React.useState('');
    const [controller] = useMyContextController();
    const { userLogin } = controller;

    React.useEffect(() => {
        if (!userLogin) {
            navigation.navigate("Login");
            return;
        }
        setUserreport(item.userreport);
        setDescription(item.description);
    }, []);

    const renderInput = (label, value, editable = false, multiline = false) => (
        <>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.multilineInput]}
                value={value}
                editable={editable}
                multiline={multiline}
                mode="outlined"
                outlineColor={BLUE_COLOR}
                textColor="black"
            />
        </>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Chi tiết lỗi</Text>
            <View style={styles.inputContainer}>
                {renderInput("Tên thiết bị", item.deviceName)}
                {renderInput("Người báo lỗi", userreport)}
                {renderInput("Ngày báo", item.reportday)}
                {renderInput("Ngày sửa", item.fixday)}
                {renderInput("Tình trạng", item.state)}
                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    multiline
                    value={description}
                    editable={false}
                    mode="outlined"
                    outlineColor={BLUE_COLOR}
                    textColor="black"
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button 
                    mode="contained" 
                    onPress={() => navigation.goBack()} 
                    style={styles.button} 
                    labelStyle={styles.buttonLabel}
                >
                    Trở về
                </Button>
            </View>
        </ScrollView>
    );
}

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
        color: BLUE_COLOR,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        color: BLUE_COLOR,
    },
    input: {
        fontSize: 16,
        marginVertical: 5,
        backgroundColor: '#FFFFFF',
    },
    multilineInput: {
        height: 100,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 1, // Add some space above the button
        marginBottom: 50, // Add some space below the button
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: BLUE_COLOR,
    },
    buttonLabel: {
        color: 'white',
    },
    contentScrollView: {
        maxHeight: '80%',  // Adjust this value as needed
    },
});

export default MyErrorDeviceDetail;
