import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";





const firebaseConfig = {
    apiKey: "AIzaSyD5nW8Ip_gj19APEBhnDujJ_ypVbSz5G9U",
    authDomain: "fileupload-f9ce5.firebaseapp.com",
    projectId: "fileupload-f9ce5",
    storageBucket: "fileupload-f9ce5.appspot.com",
    messagingSenderId: "901077492180",
    appId: "1:901077492180:web:539de11ec98e2dd78bf641"
};


//  Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
//   const storageRef = storage.ref();

function downloadFileFromStorage(fileName) {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(fileName);
    fileRef.getDownloadURL().then(function (url) {
        // Отобразить файл на странице
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
    }).catch(function (error) {
        console.error('Error while downloading file:', error);
    });
}



const newUploadTab = document.getElementById('new-upload');
const recentTab = document.getElementById('recent');
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const uploadsContainer = document.getElementById('uploads');
const recentUploadsContainer = document.getElementById('recent-uploads');
const viewAllBtn = document.getElementById('view-all-btn');

let uploads = [];

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Switching tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Hide tab content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tabContent => {
                tabContent.classList.add('hidden');
            });
            // Show tab content
            const tabName = tab.getAttribute('data-tab');
            const tabContent = document.getElementById(tabName);
            tabContent.classList.remove('hidden');
            //  Active tab
            tabs.forEach(tab => {
                tab.classList.remove('active');
            });
            tab.classList.add('active');
        });
    });
 
    fileInput.addEventListener('change', handleFilesSelect);
    // Drop zone events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefault, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlightDropZone, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlightDropZone, false);
    });
    dropZone.addEventListener('drop', handleDrop, false);
    // All uploads button click
    viewAllBtn.addEventListener('click', showAllUploads);
    // Recent uploads
    loadRecentUploads();
});


function preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
}


function highlightDropZone() {
    dropZone.classList.add('highlight');
}


function unhighlightDropZone() {
    dropZone.classList.remove('highlight');
}


function handleFilesSelect(event) {
    const files = event.target.files;
    handleFiles(files);
}


function handleDrop(event) {
    const files = event.dataTransfer.files;
    handleFiles(files);
}


function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Add file 
        uploads.push({
            name: file.name,
            size: file.size,
            date: new Date().toLocaleString(),
            file: file
        });
        // Upload file to Firebase Storage
        uploadFileToStorage(file);
        // Add file to uploads 
        const uploadElement = createUploadElement(file.name, file.size);
        uploadsContainer.appendChild(uploadElement);
    }
}

// Upload file to Firebase Storage
function uploadFileToStorage(file) {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(file.name);
    fileRef.put(file).then(function (snapshot) {
        console.log('File uploaded successfully');
    });
}

// Create upload element
function createUploadElement(name, size) {
    const uploadElement = document.createElement('div');
    uploadElement.classList.add('upload');
    const nameElement = document.createElement('p');
    // nameElement.innerHTML = <span>Name: </span> ;
    uploadElement.appendChild(nameElement);
    const sizeElement = document.createElement('p');
    // sizeElement.innerHTML = <span>Size: ${size} bytes</span>;
    uploadElement.appendChild(sizeElement);
    const dateElement = document.createElement('p');
    // dateElement.innerHTML = <span>Date: ${new Date().toLocaleString()}</span> ;
    uploadElement.appendChild(dateElement);
    return uploadElement;
}

// Load recent uploads from Firebase 
function loadRecentUploads() {
    recentUploadsContainer.innerHTML = '';
    for (let i = 0; i < uploads.length && i < 5; i++) {
        const upload = uploads[i];
        const uploadElement = createUploadElement(upload.name, upload.size);
        recentUploadsContainer.appendChild(uploadElement);
    }
}

