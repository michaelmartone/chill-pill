import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import PillAdder from './public/components/PillAdder'
import PillTaker from './public/components/PillTaker'
import PillManager from './public/components/PillManager'
import PillHistory from './public/components/PillHistory'
import PillModal from './public/components/PillModal';
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';
const storage = new MMKVLoader().initialize();
import { Pill, Dose, SessionDate } from './public/types'
import FlashMessage, { showMessage } from "react-native-flash-message";
import SettingsWindow from './public/components/SettingsWindow';
import { sayDoses, sayPills } from './public/components/SpeakModule';
import confirmation from './public/components/confirmation';

function App(): React.JSX.Element {
  const [pills, setPills] = useMMKVStorage<Pill[]>('pills', storage, [])
  const [pillTrash, setPillTrash] = useMMKVStorage<Pill[]>('pillTrash', storage, [])
  const [pillAdderOpen, setPillAdderOpen] = useMMKVStorage<boolean>('pillAdderOpen', storage, false)
  const [pillManagerOpen, setPillManagerOpen] = useMMKVStorage<boolean>('pillManagerOpen', storage, false)
  const [pillTakerOpen, setPillTakerOpen] = useMMKVStorage<boolean>('pillTakerOpen', storage, false)
  const [pillHistoryOpen, setPillHistoryOpen] = useMMKVStorage<boolean>('pillHistoryOpen', storage, false)
  const [pillHistory, setPillHistory] = useMMKVStorage<SessionDate[]>('pillHistory', storage, [])
  const [historyTrash, setHistoryTrash] = useMMKVStorage<SessionDate[][]>('historyTrash', storage, [])
  const [historyIsReverse, setHistoryIsReverse] = useMMKVStorage<boolean>('historyIsReverse', storage, false)
  const [newStyle, setNewStyle] = useMMKVStorage<boolean>('newStyle', storage, false)
  const [playSounds, setPlaySounds] = useMMKVStorage<boolean>('playSounds', storage, true)
  const [settingsWindowOpen, setSettingsWindowOpen] = useState(false)

  // setPills([])
  // setPillTrash([])
  // setPillHistory([])
  // setHistoryIsReverse(false)
  const addPill = (name: string, dosage : number, unit : string) => {
    const pill = {
      name: name,
      dosage: dosage,
      unit: unit
    }
    const oldPills = pills
    let matchingPill = false
    oldPills.forEach((oldPill) => {
      if(oldPill.name === pill.name && oldPill.dosage === pill.dosage && oldPill.unit === pill.unit) {
        matchingPill = true;
        return
      }
    })
    if(matchingPill) {
      Alert.alert('You already have a pill with that Name, Dosage, and Unit')
    } else {
      const newPills = sortPills(oldPills.concat([pill]))
      setPills(newPills)

      if (playSounds) sayPills([pill])

      setPillAdderOpen(false)
      if(newPills.length === oldPills.length + 1) {
        showMessage({
          message: 'Pill Added!',
          description: `${pill.name} ${pill.dosage}${pill.unit}`,
          type: 'warning',
          duration: 5000,
          animationDuration: 400,
          titleStyle: { fontSize: 20, color: 'black' },
          textStyle: { fontSize: 18, color: 'black' }
        })
      } else {
        showMessage({
          message: 'Error adding Pill',
          description: "",
          type: 'danger'
        })
      }
    }
  }

  const takePills = (session: Dose[], note: string, userDate: Date) => {
    const pillSwallow = {
      session: session,
      note: note,
      date: new Date(),
      userDate: userDate
    }
    const oldPillHistory = pillHistory
    let newPillHistory = []
    if (historyIsReverse) {
      newPillHistory = oldPillHistory.concat([pillSwallow])
    } else {
      newPillHistory = [pillSwallow].concat(oldPillHistory)
    }
    setPillHistory(newPillHistory)
    setPillTakerOpen(false)
    if(newPillHistory.length === oldPillHistory.length + 1) {
      if(playSounds) sayDoses(session)
      const messageArray = session.map((dose) => {
        return(`${dose.pill.name} ${dose.pill.dosage}${dose.pill.unit} x ${dose.quantity}`)
      })
      const message = messageArray.join('\n')
      showMessage({
        message: 'Pills Taken!',
        description: message,
        type: 'warning',
        duration: 5000,
        animationDuration: 400,
        titleStyle: { fontSize: 20, color: 'black' },
        textStyle: { fontSize: 18, color: 'black' }
      })
    } else {
      showMessage({
        message: 'Pill Taken Error',
        description: "",
        type: 'danger'
      })
    }
  }

  const sortPills = (pillList: Pill[]) => {
    return pillList.sort(function(a, b) {
      var textA = a.name.toUpperCase();
      var textB = b.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
  }

  const deletePill = (indexToDelete: number) => {
    const pillToTrash = pills[indexToDelete]
    const oldPillTrash = pillTrash
    const newPillTrash = sortPills(oldPillTrash.concat([pillToTrash]))
    setPillTrash(newPillTrash)
    const oldPills = pills
    const newPills = oldPills.filter((pill, index) => index !== indexToDelete)
    setPills(newPills)
  }

  const restorePill = (indexToRestore: number) => {
    const pillToRestore = pillTrash[indexToRestore]
    const oldPills = pills
    const newPills = sortPills(oldPills.concat([pillToRestore]))
    setPills(newPills)
    const oldPillTrash = pillTrash
    const newPillTrash = oldPillTrash.filter((pill, index) => index !== indexToRestore)
    setPillTrash(newPillTrash)
  }

  const emptyTrash = () => {
    confirmation(
      'Empty Trash',
      'Are you sure you want to empty your trash?',
      'cancel',
      'OK',
      () => setPillTrash([])
    );
  }

  const switchToPillAdder = () => {
    setPillManagerOpen(false)
    setPillTakerOpen(false)
    setTimeout(() => setPillAdderOpen(true), 200)
  }

  useEffect(() => {
    sortHistoryByDate()
  }, [historyIsReverse])

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Close modals in order of priority
      if (settingsWindowOpen) {
        setSettingsWindowOpen(false)
        return true // Prevent default behavior
      }
      if (pillHistoryOpen) {
        setPillHistoryOpen(false)
        return true
      }
      if (pillManagerOpen) {
        setPillManagerOpen(false)
        return true
      }
      if (pillTakerOpen) {
        setPillTakerOpen(false)
        return true
      }
      if (pillAdderOpen) {
        setPillAdderOpen(false)
        return true
      }
      // If no modals are open, show confirmation before exiting
      Alert.alert('Hold on!', 'Are you sure you want to go back?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'YES', 
          onPress: () => BackHandler.exitApp()
        },
      ]);
      return true // Prevent default behavior while Alert is shown
    })

    return () => backHandler.remove()
  }, [pillAdderOpen, pillTakerOpen, pillManagerOpen, pillHistoryOpen, settingsWindowOpen])

  const sortHistoryByDate = () => {
    const oldPillHistory = pillHistory
    const newPillHistory = oldPillHistory.sort((a: SessionDate, b: SessionDate) =>
      historyIsReverse
        ? (new Date(a.date)).getTime() - (new Date(b.date)).getTime()
        : (new Date(b.date)).getTime() - (new Date(a.date)).getTime()
    )
    setPillHistory(newPillHistory)
  }

  const clearPillHistory = () => {
    const oldPillHistory = pillHistory
    setHistoryTrash(historyTrash.concat(oldPillHistory))
    setPillHistory([])
  }

  const markEmailsAsSent = (toMarkSent: number[]) => {
    const oldPillHistory = pillHistory
    const today = new Date()
    toMarkSent.forEach(indexToMarkSent => {
      oldPillHistory[indexToMarkSent].dateEmailed = today
    })
    setPillHistory(oldPillHistory)
  }

  return (
    <SafeAreaView style={styles.app}>
      <TouchableOpacity
        style={[styles.box, styles.one, newStyle && styles.box2, newStyle && styles.one2]}
        onPress={() => setPillAdderOpen(true)}
      >
        <Text style={styles.boxText}>Add a Pill</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.box, newStyle ? styles.three : styles.two, newStyle && styles.box2, newStyle && styles.two2]}
        onPress={() => setPillTakerOpen(true)}
      >
        <Text style={styles.boxText}>Take a Pill</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.box, newStyle ? styles.two : styles.three, newStyle && styles.box2, newStyle && styles.three2]}
        onPress={() => setPillManagerOpen(true)}
      >
        <Text style={styles.boxText}>Manage Pills</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.box, styles.four, newStyle && styles.box2, newStyle && styles.four2]}
        onPress={() => setPillHistoryOpen(true)}
      >
        <Text style={styles.boxText}>Pill History</Text>
      </TouchableOpacity>

      <PillModal isVisible={pillAdderOpen} closeWindow={() => setPillAdderOpen(false)} name={"Add a Pill"}>
        <PillAdder
          addPill={(name: string, dosage: number, unit: string) => addPill(name, dosage, unit)}
        />
      </PillModal>
      <PillModal isVisible={pillTakerOpen} closeWindow={() => setPillTakerOpen(false)} name={"Take a Pill"}>
        <PillTaker
          pills={pills}
          takePills={(session: Dose[], note: string, userDate: Date) => takePills(session, note, userDate)}
          switchToPillAdder={() => switchToPillAdder()}
        />
      </PillModal>
      <PillModal isVisible={pillManagerOpen} closeWindow={() => setPillManagerOpen(false)} name={"Manage Pills"}>
        <PillManager
          pills={pills}
          pillTrash={pillTrash}
          deletePill={(index: number) => deletePill(index)}
          restorePill={(index: number) => restorePill(index)}
          emptyTrash={() => emptyTrash()}
          switchToPillAdder={() => switchToPillAdder()}
        />
      </PillModal>
      <PillModal isVisible={pillHistoryOpen} closeWindow={() => setPillHistoryOpen(false)} name={"Pill History"}>
        <PillHistory
          pillHistory={pillHistory}
          historyIsReverse={historyIsReverse}
          reverseHistory={() => setHistoryIsReverse(!historyIsReverse)}
          pillList={pills}
        />
      </PillModal>
      <TouchableOpacity onPress={() => setSettingsWindowOpen(true)} style={styles.settingsWindowOpen}>
        <Image style={styles.settingsWindowOpenIcon} source={require('./public/images/settingsIcon.png')} />
      </TouchableOpacity>
      <SettingsWindow
        isVisible={settingsWindowOpen}
        exit={() => setSettingsWindowOpen(false)}
        newStyle={newStyle}
        setNewStyle={(isNewStyle: boolean) => setNewStyle(isNewStyle)}
        historyIsReverse={historyIsReverse}
        setHistoryIsReverse={(historyIsReverse: boolean) => setHistoryIsReverse(historyIsReverse)}
        resetHistory={() => clearPillHistory()}
        playSounds={playSounds}
        setPlaySounds={(isPlaySounds: boolean) => setPlaySounds(isPlaySounds)}
      />
      <FlashMessage position={'center'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    width: "100%",
    height: "100%"
  },
  settingsWindowOpen: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
  },
  settingsWindowOpenIcon: {
    width: 40,
    height: 40,
  },
  box: {
    position: "absolute",
    width: "50%",
    height: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 1,
    borderStyle: "solid"
  },
  box2: {
    width: '100%',
    height: '25%',
    left: 0,
  },
  one2: {
    top: 0
  },
  two2: {
    top: '50%'
  },
  three2: {
    top: '25%'
  },
  four2: {
    top: '75%'
  },
  boxText: {
    color: "black",
    fontSize: 50,
    fontWeight: "500",
    textAlign: 'center',
    zIndex: -1,
  },
  one: {
    left: 0,
    top: 0,
    backgroundColor: "red"
  },
  two: {
    right: 0,
    top: 0,
    backgroundColor: "yellow"
  },
  three: {
    left: 0,
    bottom: 0,
    backgroundColor: "green"
  },
  four: {
    right: 0,
    bottom: 0,
    backgroundColor: "cornflowerblue"
  },
  styleChanger: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 100,
  },
  styleChangerText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'black'
  }
});

export default App;
