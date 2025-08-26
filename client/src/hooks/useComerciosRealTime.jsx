import React from 'react';
import { useEffect, useState } from "react";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // importa tu instancia de Firestore
export default function useComerciosRealTime  () {
    const [comercios, setComercios] = useState([]);

    useEffect(() => {
      const unsubscribe = onSnapshot(
        collection(db, "comercios"),
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setComercios(data);
        },
        (error) => {
          console.error("Error al escuchar comercios:", error);
        }
      );

      return () => unsubscribe(); // se limpia el listener al desmontar
    }, []);
   return comercios;
}


