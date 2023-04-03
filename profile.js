
// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getFirestore, orderBy, query, setDoc, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js";




const firebaseConfig = {
    apiKey: "AIzaSyD5nW8Ip_gj19APEBhnDujJ_ypVbSz5G9U",
    authDomain: "fileupload-f9ce5.firebaseapp.com",
    projectId: "fileupload-f9ce5",
    storageBucket: "fileupload-f9ce5.appspot.com",
    messagingSenderId: "901077492180",
    appId: "1:901077492180:web:539de11ec98e2dd78bf641"
};

initializeApp(firebaseConfig);
const db = getFirestore();
const fileCollectionRef = collection(db, 'files');



// Get last upload time
// Get last upload time
async function getLastUploadTime() {
    const q = query(collection(db, "files"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
        const lastUploadTime = querySnapshot.docs[0].data().date.toDate();
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - lastUploadTime.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        if (minutesDiff === 0) {
            return 'just now';
        } else if (minutesDiff === 1) {
            return '1 minute ago';
        } else if (minutesDiff < 60) {
            return `${minutesDiff} minutes ago`;
        } else if (minutesDiff < 1440) {
            const hoursDiff = Math.floor(minutesDiff / 60);
            return `${hoursDiff} hour${hoursDiff === 1 ? '' : 's'} ago`;
        } else {
            const daysDiff = Math.floor(minutesDiff / 1440);
            const dateStr = lastUploadTime.toLocaleDateString();
            const timeStr = lastUploadTime.toLocaleTimeString();
            return `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago on ${dateStr} at ${timeStr}`;
        }
    } else {
        return 'never';
    }
}

// Show last upload time
async function showLastUploadTime() {
    const lastUploadTime = await getLastUploadTime();
    const lastUploadEl = document.getElementById('time-synced');
    lastUploadEl.textContent = lastUploadTime;

}
showLastUploadTime();


