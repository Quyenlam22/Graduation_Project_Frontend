import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";

const useFirestore = (collectionName, condition) => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (
      !condition?.fieldName ||
      !condition?.operator ||
      condition.compareValue == null ||
      (Array.isArray(condition.compareValue) && condition.compareValue.length === 0)
    ) {
      setDocuments([]);
      return;
    }

    const q = query(
      collection(db, collectionName),
      where(condition.fieldName, condition.operator, condition.compareValue),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docs);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setDocuments([]);
    });

    return () => unsubscribe();
  }, [collectionName, condition?.fieldName, condition?.operator, condition?.compareValue]);

  return documents;
};

export default useFirestore;
