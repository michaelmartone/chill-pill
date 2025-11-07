import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import type {PropsWithChildren} from 'react';

type PillModalProps = PropsWithChildren<{
    isVisible: boolean;
    closeWindow: Function;
    name: string;
    backgroundColor?: string;
  }>;

const PillModal = ({isVisible, closeWindow, name, backgroundColor, children}: PillModalProps) => {
    return (
        <Modal 
            visible={isVisible} 
            animationType="slide" 
            transparent={true}
            onRequestClose={() => closeWindow()}
        >
            <View style={styles.modal}>
                <View style={[styles.window, {backgroundColor: backgroundColor || "lightgray"}]}>
                    <Text style={styles.title} allowFontScaling={false}>{name}</Text>
                    <View style={styles.children}>
                        {children}
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    window: {
        width: "100%",
        height: "100%",
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        position: "absolute",
        top: 20,
        fontSize: 50,
        color: "black",
        paddingBottom: 20,
    },
    children: {
        width: '100%',
        height: '100%',
        display: "flex",
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center"
    }
})

export default PillModal