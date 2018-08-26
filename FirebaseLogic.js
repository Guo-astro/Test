import uuid from 'uuid';
import * as c from "./constants"

import getUserInfo from './utils/getUserInfo';
import shrinkImageAsync from './utils/shrinkImageAsync';
import uploadPhoto from './utils/uploadPhoto';
import { __values } from 'tslib';

const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

const collectionName = 'kodawarin-shimizu';
const starCollectionName = 'kodawarin-shimizu-rating';

class FirebaseLogic {
    constructor() {
        firebase.initializeApp({
            apiKey: c.FIREBASE_API_KEY,
            authDomain: c.FIREBASE_AUTH_DOMAIN,
            databaseURL: c.FIREBASE_DATABASE_URL,
            projectId: c.FIREBASE_PROJECT_ID,
            storageBucket: c.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: c.FIREBASE_MESSAGING_SENDER_ID

        });
        // Some nonsense...
        firebase.firestore().settings({ timestampsInSnapshots: true });

        // Listen for auth
        firebase.auth().onAuthStateChanged(async user => {
            if (!user) {
                await firebase.auth().signInAnonymously();
            }
        });
    }

    // Download Data
    getPaged = async ({ size, start }) => {
        let ref = this.collection.orderBy('timestamp', 'desc').limit(size);
        try {
            if (start) {
                ref = ref.startAfter(start);
            }

            const querySnapshot = await ref.get();
            const data = [];
            querySnapshot.forEach(function (doc) {
                if (doc.exists) {
                    //if not set create an empty object!
                    const post = doc.data() || {};

                    // Reduce the name
                    const user = post.user || {};

                    const name = user.deviceName;
                    const reduced = {
                        key: doc.id,
                        name: (name || '物語＠こだわりん').trim(),
                        ...post,
                    };
                    data.push(reduced);
                }
            });

            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            return { data, cursor: lastVisible };
        } catch ({ message }) {
            alert(message);
        }
    };

    // Upload Data
    uploadPhotoAsync = async uri => {
        const path = `${collectionName}/${this.uid}/${uuid.v4()}.jpg`;
        return uploadPhoto(uri, path);
    };

    post = async ({ text, image: localUri }) => {
        try {
            const { uri: reducedImage, width, height } = await shrinkImageAsync(
                localUri,
            );

            const remoteUri = await this.uploadPhotoAsync(reducedImage);
            this.collection.add({
                text,
                uid: this.uid,
                timestamp: this.timestamp,
                imageWidth: width,
                imageHeight: height,
                image: remoteUri,
                user: getUserInfo(),
            });
        } catch ({ message }) {
            alert(message);
        }
    };


    setStar = async ({ uId, postId, value }) => {
        try {
            const remoteUri = await this.uploadPhotoAsync(reducedImage);
            this.starCollection.add({
                text,
                uid: uid,
                postId: postId,
                value: value
            });
        } catch ({ message }) {
            alert(message);
        }
    };

    // Helpers
    get collection() {
        return firebase.firestore().collection(collectionName);
    }
    get starCollection() {
        return firebase.firestore().collection(starCollectionName);
    }
    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }
    get timestamp() {
        return Date.now();
    }
}

FirebaseLogic.shared = new FirebaseLogic();
export default FirebaseLogic;
