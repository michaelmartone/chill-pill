import React, { PropsWithChildren } from 'react'
import { Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import SettingsCheckbox from './SettingsCheckbox';
import Button from './Button';
import confirmation from './confirmation';

type SettingsWindowProps = PropsWithChildren<{
    isVisible: boolean;
    exit: Function;
    newStyle: boolean;
    setNewStyle: Function;
    historyIsReverse: boolean;
    setHistoryIsReverse: Function;
    resetHistory: Function;
    playSounds: boolean;
    setPlaySounds: Function;
}>;

const SettingsWindow = ({isVisible, exit, newStyle, setNewStyle, historyIsReverse, setHistoryIsReverse, resetHistory, playSounds, setPlaySounds}: SettingsWindowProps) => {
    const confirmClearHistory = () => {
        confirmation(
            'Confirm Clear Pill History',
            'Are you sure you want to clear your entire Pill History? This action cannot be undone.',
            'Cancel',
            'Confirm',
            () => resetHistory()
        );
    }
    return(
        <Modal 
            visible={isVisible} 
            transparent={true} 
            animationType="fade"
            onRequestClose={() => exit()}
        >
            <View style={styles.container}>
                <View style={styles.modal}>
                    <View style={styles.titleContainer}>
                        <View style={styles.title}>
                            <Text style={styles.titleText}>Settings</Text>
                        </View>
                    </View>
                    <View style={styles.options}>
                        <View style={styles.checkboxes}>
                            <SettingsCheckbox
                                title='App Style'
                                leftLabel='Boxes'
                                rightLabel='Rows'
                                onChange={(isChecked: boolean) => setNewStyle(isChecked)}
                                defaultChecked={newStyle}
                            />
                            <SettingsCheckbox
                                title='Pill History Order'
                                leftLabel='New -> Old'
                                rightLabel='Old -> New'
                                onChange={(isChecked: boolean) => setHistoryIsReverse(isChecked)}
                                defaultChecked={historyIsReverse}
                            />
                            <SettingsCheckbox
                                title='Play Sound'
                                leftLabel='Off'
                                rightLabel='On'
                                onChange={(isChecked: boolean) => setPlaySounds(isChecked)}
                                defaultChecked={playSounds}
                            />
                            <View style={styles.clearPillHistory}>
                                <Button title={'Clear Pill History'} onPress={() => confirmClearHistory()}/>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
    },
    modal: {
        width: "90%",
        height: 525,
        backgroundColor: "white",
        borderColor: "black",
        borderWidth: 2,
        borderStyle: "solid"
    },
    titleContainer: {
        width: "100%",
        height: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    title: {
        width: "80%",
        marginTop: 20,
        borderBottomColor: "#000500",
        borderBottomWidth: 1,
        // borderBottomStyle: "solid",
    },
    titleText: {
        fontSize: 32,
        textAlign: "center",
        color: 'black'
    },
    options: {
        display: "flex",
        flexDirection: "column",
        justifyContent: 'space-evenly',
        alignItems: "center",
        width: "100%",
        // marginTop: 20,
    },
    optionTitle: {
        textAlign: 'center',
        margin: 10,
    },
    checkboxes: {
        width: "100%",
        height: 100,
        display: "flex",
        flexDirection: 'column',
        alignItems: "center",
    },
    option: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
        marginTop: 10,
    },
    optionCheckboxContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginRight: 10,
        marginLeft: 15,
    },
    optionCheckbox: {
        right: 10,
        top: 0,
        bottom: 0,
        textAlign: "right",
    },
    switch: {
        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]
    },
    optionTextContainer: {
        width: "70%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginLeft: 10,
    },
    optionText: {
        fontSize: 18,
    },
    gameTimerSelector: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        marginTop: 20,
    },
    gameTimerSelectorLabel: {
        fontSize: 15,
    },
    gameTimeDropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        width: 150
    },
    clearPillHistory: {
        height: '100%',
        display: 'flex',
        marginTop: 10,
        flexDirection: 'column',
        justifyContent: 'center',
    },
})

export default SettingsWindow;