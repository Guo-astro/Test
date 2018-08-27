import { AsyncStorage } from "react-native";
import { auth, database, provider } from "./app/config/firebase";

export const USER_KEY = "auth-demo-key";

export const onSignIn = () => AsyncStorage.setItem(USER_KEY, "true");

export const onSignOut = () => AsyncStorage.removeItem(USER_KEY);


export function register(data, callback) {
  const { email, password, username } = data;
  auth.createUserWithEmailAndPassword(email, password)
      .then((resp) => createUser({ username, uid: resp.user.uid }, callback))
      .catch((error) => callback(false, null, error));
}

//Create the user object in realtime database
export function createUser(user, callback) {
  const userRef = database.ref().child('users');
  console.log(user)
  userRef.child(user.uid).update({ ...user })
      .then(() => callback(true, user, null))
      .catch((error) => callback(false, null, { message: error }));
}

export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(USER_KEY)
      .then(res => {
        if (res !== null) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  });
};
