import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Button from "./Button";
import type {PropsWithChildren} from 'react';
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Pill, Dose } from '../types'
import confirmation from "./confirmation";
import strings from "../Strings";


type PillTakerProps = PropsWithChildren<{
    pills: Pill[];
    takePills: Function;
    switchToPillAdder: Function;
}>;

interface SessionIndex {
    [key: string]: Dose[]
}

const PillTaker = ({pills, takePills, switchToPillAdder}: PillTakerProps) => {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(0)
    const [items, setItems] = useState(pills.map((pill, index) => {
        return {label: `${pill.name}: ${pill.dosage}${pill.unit}`, value: index}
    }))
    const QUANTITY_LIST = [1,2,3,4,5,6,7,8,9].map((num) => {return {label: num.toString(), value: num}})
    const [openQ, setOpenQ] = useState(false)
    const [valueQ, setValueQ] = useState(1)
    const [itemsQ, setItemsQ] = useState(QUANTITY_LIST)

    const [pillSession, setPillSession] = useState<Dose[]>([])

    const [noteOpen, setNoteOpen] = useState<boolean>(false)
    const [sessionNote, setSessionNote] = useState<string>('')

    const [dateOpen, setDateOpen] = useState<boolean>(false)
    const [sessionDate, setSessionDate] = useState<Date|undefined>(undefined)

    const addPillsToSession = (pill: Pill, quantity: number) => {
        const oldSession = pillSession
        let newSession = oldSession.concat([{pill: pill, quantity: quantity}])
        newSession = simplifySession(newSession)
        setPillSession(newSession)
    }

    const deletePillFromSession = (indexToDelete: number) => {
        const oldSession = pillSession
        let newSession = oldSession.filter((el, index) => index !== indexToDelete)
        setPillSession(newSession)
    }

    const simplifySession = (oldSession: Dose[]) => {
        const sessionIndex:SessionIndex = {}
        oldSession.forEach((dose) => {
            if(sessionIndex[dose.pill.name]) {
                // Pill of that name is already in Index
                const dosesOfThatName = sessionIndex[dose.pill.name]
                const matchingPill = dosesOfThatName.find((doseInIndex: Dose) => doseInIndex.pill.dosage === dose.pill.dosage)
                if (matchingPill) {
                    // Dosage Matches
                    const indexOfMatchingPill = dosesOfThatName.findIndex((pill) => pill ===matchingPill)
                    sessionIndex[dose.pill.name][indexOfMatchingPill].quantity = dosesOfThatName[indexOfMatchingPill].quantity + dose.quantity
                } else {
                    // Add Pill of that Dosage
                    sessionIndex[dose.pill.name] = sessionIndex[dose.pill.name].concat([{pill: dose.pill, quantity: dose.quantity}])
                }
            } else {
                // Add pill name to Index
                sessionIndex[dose.pill.name] = [{pill: dose.pill, quantity: dose.quantity}]
            }
        })
        let newSession : Dose[] = []
        Object.keys(sessionIndex).sort((a,b) => {
            const textA = a.toUpperCase();
            const textB = b.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }).forEach((name) => {
            sessionIndex[name].forEach((dose) => {
                newSession = newSession.concat([{
                    quantity: dose.quantity,
                    pill: {
                        name: name,
                        dosage: dose.pill.dosage,
                        unit: "mg"
                    }
                }])
            })
        })
        return newSession
    }

    const confirmTakePills = (pillSession: Dose[], sessionNote: string, sessionDate?: Date) => {
        pillSession.length > 0
            ?   takePills(pillSession, sessionNote, sessionDate)
            :   confirmation(
                    'Confirmation',
                    'No pills added.  Add Note Anyway?',
                    'Cancel',
                    'Add Note without Pills',
                    () => takePills(pillSession, sessionNote, sessionDate)
                )
    }

    const confirmCloseNote = () => {
        confirmation(
            'Confirm Close Note',
            'Closing the note window will delete the note.  Would you like to delete your note?',
            'No, keep note open',
            'Yes, delete the note',
            () => {setNoteOpen(false); setSessionNote('')}
        )
    }

    return (
        <View style={[styles.window, pills.length > 0 && {paddingTop: 150}]}>
            {pills.length === 0 &&
                <View>
                    <Text style={styles.noPillsText}>No pills to take!</Text>
                    <TouchableOpacity onPress={() => switchToPillAdder()}>
                        <Text style={[styles.noPillsText, styles.addPillsText]}>Add some pills!</Text>
                    </TouchableOpacity>
                    
                </View>
            }
            {pills.length > 0 && <View style={styles.pillsView}>
                <View style={styles.picker}>
                    <View style={styles.pillPicker}>
                        <DropDownPicker
                            open={open}
                            setOpen={setOpen}
                            items={items}
                            setItems={setItems}
                            value={value}
                            setValue={setValue}
                            placeholder={'Choose a pill'}
                            textStyle={{fontSize: 20}}
                        />
                    </View>
                    <Text style={styles.xText} allowFontScaling={false}>X</Text>
                    <View style={styles.quantityPicker}>
                        <DropDownPicker
                            open={openQ}
                            setOpen={setOpenQ}
                            items={itemsQ}
                            setItems={setItemsQ}
                            value={valueQ}
                            setValue={setValueQ}
                            placeholder={'0'}
                            textStyle={{fontSize: 20}}
                        />
                    </View>
                </View>
                <Button
                    title="Add Pill"
                    onPress={() => addPillsToSession(pills[value], valueQ)}
                    disabled={items.length == 0}
                    width={300}
                    color={'lightskyblue'}
                />
                <View style={styles.pillSession}>
                    {pillSession.map((dose, index) => {
                        return (
                            <View style={styles.sessionDose} key={index}>
                                <TouchableOpacity style={styles.deleteIconButton} onPress={() => deletePillFromSession(index)}>
                                    <Image style={styles.deleteIcon} source={require("../images/delete.png")}/>
                                </TouchableOpacity>
                                <Text style={styles.sessionDoseText} key={index}>{dose.pill.name}: {dose.pill.dosage}{dose.pill.unit} X {dose.quantity}</Text>
                            </View>
                        )
                    })}
                </View>
                {!noteOpen &&
                    <TouchableOpacity style={styles.addNoteButton} onPress={() => setNoteOpen(true)}>
                        <Text style={styles.addNoteButtonText}>Add Note</Text>
                    </TouchableOpacity>
                }
                {noteOpen &&
                    <View style={styles.noteInput}>
                        <View style={styles.noteInputHeading}>
                        <Text style={styles.noteInputLabel}>Note:</Text>
                        <TouchableWithoutFeedback onPress={() => sessionNote ? confirmCloseNote() : setNoteOpen(false)}>
                            <Text style={styles.closeNoteButton}>✖</Text>
                        </TouchableWithoutFeedback>
                        </View>
                        <View style={styles.noteInputText}>
                            <View style={styles.noteInputTextBorder}>
                                <TextInput
                                    style={styles.noteInputText}
                                    onChangeText={(note) => setSessionNote(note)}
                                />
                            </View>
                        </View>
                    </View>
                }
                {sessionDate
                    ?
                        <View style={[styles.addTimeSection, noteOpen ? {bottom: 175} : {bottom: 75}]}>
                            <TouchableOpacity onPress={() => setDateOpen(true)}>
                                <Text style={styles.addTimeButtonText}>{`${sessionDate.toDateString()}, ${sessionDate.toLocaleTimeString()}`}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSessionDate(undefined)}>
                                <Image style={styles.deleteDateButtonIcon} source={require('../images/delete.png')}/>
                            </TouchableOpacity>
                        </View>
                    :
                        <TouchableOpacity onPress={() => setDateOpen(true)} style={[styles.addTimeButton, noteOpen ? {bottom: 175} : {bottom: 75}]}>
                            <Text style={styles.addTimeButtonText}>{strings.DATE_TIME}</Text>
                        </TouchableOpacity>

                }
                <DateTimePickerModal
                    isVisible={dateOpen}
                    mode='datetime'
                    onConfirm={(date) => {setSessionDate(date); setDateOpen(false);}}
                    onCancel={() => setDateOpen(false)}
                    date={sessionDate}
                />
                <View style={styles.takePillsButton}>
                    <Button
                        title="Take Pills"
                        color="lightskyblue"
                        onPress={() => confirmTakePills(pillSession, sessionNote, sessionDate)}
                        disabled={pillSession.length === 0 && !sessionNote}
                        width={300}
                    />
                </View>
            </View>}
        </View>
    )
}

const styles = StyleSheet.create({
    window: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    noPillsText: {
        color: 'black',
        fontSize: 20,
        textAlign: "center",
        margin: 5,
    },
    addPillsText: {
        color: 'blue',
    },
    pillsView: {
        width: "100%",
        height: "100%",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    picker: {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-end",
        height: 50,
        marginBottom: 20,
    },
    pillPicker: {
        width: "70%",
    },
    xText: {
        fontSize: 30,
        color: "black",
        margin: 5
    },
    quantityPicker: {
        width: "20%"
    },
    pillSession: {
        height: "60%",
        margin: 10,
    },
    sessionDose: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    sessionDoseText: {
        fontSize: 20,
        color: "black"
    },
    deleteIcon: {
        width: 20,
        height: 20,
    },
    deleteIconButton: {
        width: 20,
        height: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 15
    },
    addNoteButton: {
        position: 'absolute',
        bottom: 75,
        left: 20,
    },
    addNoteButtonText: {
        color: 'blue'
    },
    closeNoteButton: {
        color: 'black'
    },
    noteInput: {
        position: 'absolute',
        bottom: 80,
        flex: 1,
        width: '90%'
    },
    noteInputHeading: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    noteInputLabel: {
        color: "black",
        fontSize: 20,
    },
    noteInputText: {
        fontSize: 20,
        backgroundColor: "white",
        color: 'black',
    },
    noteInputTextBorder: {
        borderColor: "black",
        borderWidth: 1,
        borderStyle: "solid",
    },
    addTimeSection: {
        position: 'absolute',
        right: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    addTimeButton: {
        position: 'absolute',
        right: 20,
    },
    addTimeButtonText: {
        color: 'blue'
    },
    deleteDateButtonIcon: {
        height: 20,
        width: 20,
        marginLeft: 10,
    },
    takePillsButton: {
        position: "absolute",
        bottom: 10,
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }
})

export default PillTaker