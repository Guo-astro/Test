import firebase from 'firebase';
  /**
     * @param {string} uri
     *  @param {string} uploadUri Firebase Storage uplaod Path
     */
function uploadPhoto(uri, uploadUri) {
  return new Promise(async (res, rej) => {
    const response = await fetch(uri);
    const blob = await response.blob();
  
    // https://firebase.google.com/docs/storage/web/upload-files
    const ref = firebase.storage().ref(uploadUri);

    /**
     * 'state_changed' observer, called any time the state changes
     */
    const unsubscribe = ref.put(blob).on(
      'state_changed',
      state => {},
      err => {
        unsubscribe();
        rej(err);
      },
      async () => {
        unsubscribe();
        const url = await ref.getDownloadURL();
        res(url);
      },
    );
  });
}

export default uploadPhoto;
