import { addDoc, collection, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./config"

export const addDocument = async (collectionName, data) => {
  try {
    const query = collection(db, collectionName);
    const docRef = await addDoc(query, data);
    return docRef;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

export const editDocument = async (collection, data) => {
  try {
    await updateDoc(collection, data);
  } catch (error) {
    console.error("Error editing document: ", error);
  }
};

export const deleteDocument = async (collection) => {
  try {
    await deleteDoc(collection);
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
};