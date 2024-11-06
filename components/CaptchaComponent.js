import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

const CaptchaComponent = ({ onCaptchaChange }) => {
    const [captcha, setCaptcha] = useState({ question: '', answer: 0 });
    const [userInput, setUserInput] = useState('');

    const generateNewCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 10);
        const operation = Math.random() > 0.5 ? '+' : '-';
        const question = `${num1} ${operation} ${num2}`;
        const answer = operation === '+' ? num1 + num2 : num1 - num2;
        setCaptcha({ question, answer });
        setUserInput('');
        onCaptchaChange({ userInput: '', captcha: { question, answer } });
    };

    useEffect(() => {
        generateNewCaptcha();
    }, []);

    const handleInputChange = (text) => {
        setUserInput(text);
        onCaptchaChange({ userInput: text, captcha });
    };

    return (
        <View style={styles.captchaContainer}>
            <Text style={styles.captchaText}>{captcha.question}</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={userInput}
                    onChangeText={handleInputChange}
                    keyboardType="numeric"
                    placeholder="Nhập"
                    placeholderTextColor="#888"
                />
                <IconButton
                    icon="refresh"
                    onPress={generateNewCaptcha}
                    style={styles.refreshButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    captchaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '76%',
        marginVertical: 10,
    },
    captchaText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 10,
        color:"black",
        textAlign:"center"
    },
    inputContainer: {
        flexDirection: 'row',
        width: '90%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 5,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 10,
        width: '70%',
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        textAlign: 'left',
    },
    refreshButton: {
        marginLeft: 5,
    },
});

export default CaptchaComponent;
