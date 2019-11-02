import { AsyncStorage } from 'react-native'

const FLASHCARD_STORAGE_KEY = 'UdacityFlashcards'


export function saveData(data)  {
     AsyncStorage.mergeItem(FLASHCARD_STORAGE_KEY, data)
}


export function getInitialData()  {
    const value =  AsyncStorage.getItem(FLASHCARD_STORAGE_KEY)
    if(value !== null) {
      return(value)
    }
}
