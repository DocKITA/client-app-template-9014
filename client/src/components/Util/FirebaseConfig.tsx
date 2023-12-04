import React, { useEffect } from 'react'
import { initializeApp } from 'firebase/app';
import { getDownloadURL ,getStorage, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { v4 } from 'uuid';

const app = initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APPID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID
});

const storage = getStorage(app);

// const FirebaseConfig = () => {
//     return storage
// }

const firebaseStore = (file: File, path: string) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `${path}/${v4()}`);
        const metadata = { contentType: file.type };
    
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
        uploadTask.on('state_changed',
            (snapshot) => {
                // Progress monitoring can be added here if needed
            },
            (error) => {
                console.error('Error uploading file:', error);
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    // console.log('File uploaded:', downloadURL);
                    resolve(downloadURL);
                }).catch((error) => {
                    console.error('Error getting download URL:', error);
                    reject(error);
                });
            }
        );
    });
};

export { storage, firebaseStore }