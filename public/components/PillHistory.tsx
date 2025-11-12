import React, { useEffect, useState } from "react";
import { BackHandler, Share, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type {PropsWithChildren} from 'react';
import { Pill, SessionDate } from '../types'
import Button from "./Button";
import DropDownPicker from "react-native-dropdown-picker";
import strings from "../Strings";

type PillHistoryProps = PropsWithChildren<{
    pillHistory: SessionDate[];
    historyIsReverse: boolean;
    reverseHistory: Function;
    pillList: Pill[];
}>;

const PillHistory = ({pillHistory, historyIsReverse, reverseHistory, pillList}: PillHistoryProps) => {
    const [filterOptionsOpen, setFilterOptionsOpen] = useState<boolean>(false)
    const [filterPickerOpen, setFilterPickerOpen] = useState<boolean>(false)
    const [pills, setPills] = useState(pillList.map((pill, index) => {
        return { label: `${pill.name}: ${pill.dosage}${pill.unit}`, value: index }
    }))
    const [filterValue, setFilterValue] = useState<number|null>(null)

    // Handle Android back button for EmailModal
    useEffect(() => {
        if (!emailSectionOpen) return

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            setEmailSectionOpen(false)
            return true // Prevent default behavior
        })

        return () => backHandler.remove()
    }, [emailSectionOpen])

    const downloadHistory = () => {
        // TODO: Implement history download functionality
    }

    /**
     * Formats the displayed pill history as text for sharing
     */
    const formatHistoryForShare = (historyToFormat: SessionDate[]): string => {
        const historyLines: string[] = []
        
        historyToFormat.forEach((sessionDate: SessionDate) => {
            const { session, note, userDate } = sessionDate
            const date = new Date(sessionDate.date)
            const userDateObj = userDate ? new Date(userDate) : null
            
            // Add session date
            historyLines.push(`${date.toDateString()}, ${date.toLocaleTimeString()}`)
            
            // Add user date if available
            if (userDateObj && !isNaN(userDateObj.getTime())) {
                historyLines.push(`Date Taken: ${userDateObj.toDateString()}, ${userDateObj.toLocaleTimeString()}`)
            }
            
            // Add note if available
            if (note) {
                historyLines.push(note)
            }
            
            // Add pills taken
            session.forEach((swallow) => {
                historyLines.push(`\t${swallow.pill.name}, ${swallow.pill.dosage}${swallow.pill.unit} X ${swallow.quantity}`)
            })
            
            historyLines.push('') // Empty line between sessions
        })
        
        return historyLines.join('\n')
    }

    const shareHistory = async () => {
        try {
            const historyText = formatHistoryForShare(pillHistoryDisplay)
            await Share.share({
                message: historyText,
                title: 'Pill History'
            })
        } catch (error) {
            console.error('Error sharing history:', error)
        }
    }

    const samePill = (pill1: Pill, pill2: Pill) => {
        return pill1.name === pill2.name && pill1.dosage === pill2.dosage && pill1.unit === pill2.unit
    }

    const pillHistoryDisplay = filterValue !== null
        ? pillHistory.filter(sessionDate => {
            const session = sessionDate.session
            const filteredPill = pillList[filterValue]
            const includesFilteringPill = (session.filter(dose => samePill(dose.pill, filteredPill)).length > 0)
            return includesFilteringPill
        })
        : pillHistory

    return (
        <View style={styles.window}>
            <View style={[styles.history, {marginTop: 80}]}>
                <View style={{width: '80%', height: 20, display: 'flex', justifyContent: 'space-between',
                    flexDirection: filterOptionsOpen ? 'column': 'row',
                }}>
                    <TouchableOpacity onPress={() => reverseHistory()}>
                        <Text style={styles.isReverseHistoryLabel}>
                            {historyIsReverse ? 'Old → New' : 'New → Old'}
                        </Text>
                    </TouchableOpacity>
                    {filterOptionsOpen
                        ?   <View style={[styles.filterContainer, {marginTop: 10}]}>
                                <TouchableOpacity onPress={() => {setFilterOptionsOpen(false); setFilterValue(null)}}>
                                    <Text style={styles.closeFilterButton} allowFontScaling={false}>
                                        ✖
                                    </Text>
                                </TouchableOpacity>
                                <View style={styles.filterDropdownContainer}>
                                    <DropDownPicker
                                        open={filterPickerOpen}
                                        setOpen={setFilterPickerOpen}
                                        items={pills}
                                        setItems={setPills}
                                        value={filterValue}
                                        setValue={setFilterValue}
                                        placeholder={'Filter by Pill'}
                                        textStyle={{fontSize: 20}}
                                    />
                                </View>
                            </View>
                        :   <TouchableOpacity onPress={() => setFilterOptionsOpen(true)}>
                                <Text style={styles.openFilterButton}>
                                    Filter
                                </Text>
                            </TouchableOpacity>
                    }
                </View>
                <ScrollView style={[styles.historyScroll, filterOptionsOpen && {marginTop: 70}]}>
                    <Text selectable={true}>
                    {pillHistoryDisplay.map((sessionDate: SessionDate, index) => {
                        const { session, note, userDate } = sessionDate
                        const date = new Date(sessionDate.date)
                        const userDateObj = userDate ? new Date(userDate) : null
                        return (
                            <Text style={styles.session} key={index}>
                                <Text style={styles.dateText}>{date.toDateString()}, {date.toLocaleTimeString()}{"\n"}</Text>
                                {userDateObj && !isNaN(userDateObj.getTime()) && <Text style={styles.noteText}>{strings.DATE_TIME}: {userDateObj.toDateString()}, {userDateObj.toLocaleTimeString()}{"\n"}</Text>}
                                {note && <Text style={styles.noteText}>{note}{"\n"}</Text>}
                                {session.map(((swallow, index) => {
                                    return(
                                        <Text style={styles.dose} key={index}>{"\t\t"}{swallow.pill.name}, {swallow.pill.dosage}{swallow.pill.unit} X {swallow.quantity}{"\n"}</Text>
                                    )
                                }))}
                                {"\n"}
                            </Text>
                        )
                    })}
                    </Text>
                </ScrollView>
            </View>
            <View style={styles.downloadHistoryButton}>
                <Button title="Download Pill History" onPress={() => downloadHistory()}></Button>
            </View>
            <TouchableOpacity onPress={shareHistory} style={styles.shareButton}>
                <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    window: {
        width: "100%",
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    isReverseHistoryLabel: {
        color: 'blue'
    },
    openFilterButton: {
        color: 'blue',
    },
    closeFilterButton: {
        color: 'black',
        padding: 5,
        fontSize: 20
    },
    filterContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    filterDropdownContainer: {},
    history: {
        width: '100%',
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center'
    },
    historyScroll: {
        width: '90%',
        flex: 1,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'darkgray',
        marginBottom: 70,
    },
    swallow: {
        color: "black"
    },
    session: {
        margin: 10
    },
    dose: {
        color: "black",
        marginLeft: 10,
    },
    dateText: {
        color: "black",
        fontSize: 20
    },
    noteText: {
        color: 'black',
        fontSize: 15,
    },
    shareButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'cornflowerblue',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    shareButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    downloadHistoryButton: {
        position: 'absolute',
        bottom: 10,
        display: 'none'
    }
})

export default PillHistory