import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import firestore from '@react-native-firebase/firestore';
import { useMyContextController } from '../store';

const BLUE_COLOR = '#0000CD';

const Error = ({ route, navigation }) => {
    const { device } = route.params;
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [controller] = useMyContextController();
    const { userLogin } = controller;
    const [deviceRoom, setDeviceRoom] = useState('');

    useEffect(() => {
        // Fetch device room information
        const fetchDeviceRoom = async () => {
            try {
                const deviceDoc = await firestore().collection('DEVICES').doc(device.id).get();
                if (deviceDoc.exists) {
                    setDeviceRoom(deviceDoc.data().departmentName || 'N/A');
                }
            } catch (error) {
                console.error("Error fetching device room:", error);
                setDeviceRoom('N/A');
            }
        };

        fetchDeviceRoom();
    }, [device.id]);

    const addErrorReport = async () => {
        if (!description.trim()) {
            setError('Vui lòng nhập mô tả lỗi');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const today = new Date();
            await firestore().collection('ERROR').add({
                deviceName: device.name || 'Không có thông tin',
                deviceType: device.type || 'Không có thông tin',
                specifications: device.specs || {},
                note: device.notes || 'Không có thông tin',
                description: description,
                reportday: today.toISOString().split('T')[0],
                userreport: userLogin.email,
                deviceRoom: deviceRoom,
                state: "Chưa sửa",
                fixday: ""
            });
            Alert.alert('Thông báo', 'Hệ thống đã ghi nhận và sẽ gửi phản hồi sớm nhất!');
            navigation.goBack();
        } catch (error) {
            console.error("Lỗi:", error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi báo cáo.');
        } finally {
            setLoading(false);
        }
    }

    const renderInput = (label, value, onChangeText, editable = true, multiline = false) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.multilineInput]}
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                multiline={multiline}
                mode="outlined"
                outlineColor={BLUE_COLOR}
                theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
                textColor="black"
            />
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Báo Lỗi</Text>
            <View style={styles.formContainer}>
                {renderInput("Tên thiết bị", device.name, null, false)}
                {renderInput("Phòng", deviceRoom, null, false)}
                {renderInput("Email", userLogin.email, null, false)}
                {renderInput("Ngày báo", new Date().toLocaleString(), null, false)}
                {renderInput("Mô tả", description, setDescription, true, true)}
                {error ? <HelperText type="error" style={styles.errorText}>{error}</HelperText> : null}
                <View style={styles.buttonContainer}>
                    <Button 
                        mode="contained" 
                        onPress={addErrorReport} 
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                        loading={loading}
                        disabled={loading}
                    >
                        Gửi
                    </Button>
                    <Button 
                        mode="contained" 
                        onPress={() => navigation.goBack()} 
                        style={[styles.button, styles.cancelButton]}
                        labelStyle={styles.buttonLabel}
                        disabled={loading}
                    >
                        Huỷ
                    </Button>
                </View>
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
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
    },
    inputContainer: {
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: BLUE_COLOR,
    },
    input: {
        backgroundColor: 'white',
    },
    multilineInput: {
        height: 100,
    },
    errorText: {
        fontSize: 14,
        color: 'red',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: BLUE_COLOR,
    },
    cancelButton: {
        backgroundColor: '#FF0000',
    },
    buttonLabel: {
        color: 'white',
        fontSize: 16,
    },
});

export default Error;
