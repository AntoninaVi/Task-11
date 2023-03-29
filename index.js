// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getFirestore, setDoc, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js";




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



const tabButtons = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadsList = document.getElementById('uploads');
const recentUploadsList = document.getElementById('recent-uploads');
const viewAllButton = document.getElementById('view-all-btn');

// Event listeners
tabButtons.forEach(button => button.addEventListener('click', handleTabClick));
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
viewAllButton.addEventListener('click', handleViewAll);
//   getRecentUploads();
// Show New by default
showTab('new-upload');

// Handle tab clicks
function handleTabClick(event) {
    const tab = event.target.dataset.tab;
    showTab(tab);
}

// Show the specified tab and hide others
function showTab(tab) {
    tabButtons.forEach(button => {
        if (button.dataset.tab === tab) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    tabContents.forEach(content => {
        if (content.id === tab) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

// drag over events on drop zone
function handleDragOver(event) {
    event.preventDefault();
    dropZone.classList.add('dragover');
}

// drag leave events on drop zone
function handleDragLeave(event) {
    event.preventDefault();
    dropZone.classList.remove('dragover');
}

// drop events on drop zone
function handleDrop(event) {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files;
    handleFiles(files);
}


function handleFileSelect(event) {
    event.preventDefault();
    const files = event.target.files;
    handleFiles(files);
}

// Function to handle files
function handleFiles(files) {
    // Loop through the selected files
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Check if the file is an image
        if (!file.type.startsWith('image/')) {
            alert('Only image files are allowed.');
            continue;
        }
        // Add file to the uploads list
        addUploadToList(file);
        // Upload file to the data
        uploadFileToDatabase(file);
    }
    // Clear file input
    fileInput.value = '';
}

function handleFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleFiles(files);
}

// Function to add a file to the uploads list
function addUploadToList(file) {
    const uploadItem = document.createElement('div');
    uploadItem.className = 'upload-item';
    const name = document.createElement('p');
    name.innerHTML = file.name;
    const size = document.createElement('p');
    size.innerHTML = formatBytes(file.size);
    const time = document.createElement('p');
    time.innerHTML = formatDate(new Date());
    uploadItem.appendChild(name);
    uploadItem.appendChild(size);
    uploadItem.appendChild(time);
    // Add the file to the recent uploads list
    recentUploadsList.insertBefore(uploadItem, recentUploadsList.firstChild);
    // Remove the last item from the recent uploads list if it has more than 5 items
    if (recentUploadsList.children.length > 5) {
        recentUploadsList.removeChild(recentUploadsList.lastChild);
    }
}



// Function to format bytes 
function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Bytes';
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}
// Function to format a date to a string
function formatDate(date) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    return date.toLocaleDateString('en-US', options);
}




// // }
// Upload a file to data
async function uploadFileToDatabase(file) {
    try {
        const docRef = await addDoc(fileCollectionRef, { name: file.name, size: file.size, date: new Date() });
        console.log("File added with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding file: ", e);
    }
}





// 

// format file size 
function formatFileSize(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return size.toFixed(1) + " " + units[unitIndex];
}

// format time ago 
// function formatTimeAgo(date) {
//     const elapsed = (new Date() - date) / 1000;
//     if (elapsed < 60) {
//         return Math.round(elapsed) + " seconds ago";
//     } else if (elapsed < 3600) {
//         return Math.round(elapsed / 60) + " minutes ago";
//     } else if (elapsed < 86400) {
//         return Math.round(elapsed / 3600) + " hours ago";
//     } else {
//         return Math.round(elapsed / 86400) + " days ago";
//     }
// }


async function handleViewAll() {
    // Get all files from the database
    const querySnapshot = await getDocs(fileCollectionRef);
    // Clear the recent uploads list
    recentUploadsList.innerHTML = '';
    // Loop through the files and add them to the uploads list
    querySnapshot.forEach((doc) => {
        const fileData = doc.data();
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        const name = document.createElement('p');
        name.innerHTML = fileData.name;
        const size = document.createElement('p');
        size.innerHTML = formatBytes(fileData.size);
        const time = document.createElement('p');
        time.innerHTML = formatDate(new Date(fileData.uploadTime));

        fileItem.appendChild(name);
        fileItem.appendChild(size);
        fileItem.appendChild(time);
        uploadsList.appendChild(fileItem);
    });
    // Hide the recent uploads list and show the uploads list
    recentUploadsList.classList.add('hidden');
    uploadsList.classList.remove('hidden');
}



function createUploadItem(upload) {
    const uploadItem = document.createElement('div');
    uploadItem.className = 'upload-item';
    const name = document.createElement('p');
    name.innerHTML = upload.name;
    const size = document.createElement('p');
    size.innerHTML = formatBytes(upload.size);
    const time = document.createElement('p');
    time.innerHTML = formatDate(upload.time.toDate());
    uploadItem.appendChild(name);
    uploadItem.appendChild(size);
    uploadItem.appendChild(time);
    return uploadItem;
}

