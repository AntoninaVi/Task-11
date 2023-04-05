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



const tabButtons = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadsList = document.getElementById('uploads');
const recentUploadsList = document.getElementById('recent-uploads');
const recentTab = document.getElementById('recent')
const viewAllButton = document.getElementById('view-all-btn');
const syncedTime = document.getElementById('time-synced');

const loader = document.getElementById('loader');

// Event listeners
tabButtons.forEach(button => button.addEventListener('click', handleTabClick));
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
viewAllButton.addEventListener('click', handleViewAll);




const recentlyUploadedFiles = [];


async function getRecentUploads() {
    const filesQuery = query(collection(db, "files"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(filesQuery);
    recentUploadsList.innerHTML = '';
    let count = 0;
    const recentFiles = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const file = { name: data.name, size: formatBytes(data.size), time: formatDate(data.date.toDate()), type: data.type };
        // Check if file added to recentlyUploadedFiles
        if (!recentlyUploadedFiles.find((f) => f.name === file.name && f.size === file.size)) {
            recentFiles.push(file);
            recentlyUploadedFiles.push(file);
            count++;
        }
        // Show recent 5 uploads
        if (count >= 5) recentFiles.length = 5; {
            return;
        }
    });

    recentUploadsList.innerHTML = recentFiles.map(file => `<div class="upload-item"><div class="upload-item__content"><img class="upload-item__img" src="${getIconForFileType(file.type)}"><div class="upload-item__name-time-wrapper"><p class="upload-item__name">${file.name}</p><p class="upload-item__time">${file.time}</p></div></div><div class="upload-item__content-size"> <p class="upload-item__size">${file.size}</p><button class="upload-item__btn"></button></div></div>`).join('');
}


// Handle tab clicks
function handleTabClick(event) {
    const tab = event.target.dataset.tab;
    showTab(tab);
}

// Show the specified tab
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

// drag over events 
function handleDragOver(event) {
    event.preventDefault();
    dropZone.classList.add('dragover');
}

// drag leave events 
function handleDragLeave(event) {
    event.preventDefault();
    dropZone.classList.remove('dragover');
}

// drop events 
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

async function handleFiles(files) {

    // Loader
    document.getElementById('loader').classList.remove('hidden');
    await new Promise(resolve =>
    setTimeout(resolve, 2000));

    document.getElementById('loader').classList.add('hidden');


    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type) {
            alert('This file has no type!');
            continue;
        }
        const maxSize = 100 * 1024 * 1024; // 100 MB
        if (file.size > maxSize) {
            alert('This file is too big!');
            continue;
        }

        // Add file to upload list
        addUploadToList(file);
        // Upload file data
        await uploadFileToDatabase(file);
        // Show Recent tab
        showTab('recent');
        // Get recent uploads and show
        // await getRecentUploads();
        // Hide other tabs
        tabContents.forEach(content => {
            if (content.id !== 'recent') {
                content.classList.add('hidden');
            }
        });
    }
    // Clear file input
    fileInput.value = '';

}

//drag drop event
function handleFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleFiles(files);
}



const fileTypes = {
    'image/jpeg': '/image.svg',
    'image/svg': '/image.svg',
    'image/png': '/image.svg',
    'application/pdf': 'pdf.svg',
    'application/folder': '/folder.svg',
    'application/doc': '/document.svg',
    'text/plain': '/document.svg',
};

//Icons for each file
function getIconForFileType(fileType) {
    const iconFileName = fileTypes[fileType];
    if (iconFileName) {
        return `./img/${iconFileName}`;
    } else {
        return './img/document.svg';
    }
}

//  Add file
function addUploadToList(file) {

    const existingWrapper = uploadsList.querySelector(`[data-name="${file.name}"]`);

    if (existingWrapper) {
        // exists -> update
        const sizeElem = existingWrapper.querySelector('.upload-item__size');
        sizeElem.innerText = formatBytes(file.size);

        const timeElem = existingWrapper.querySelector('.upload-item__time');
        timeElem.innerText = formatDate(new Date());

        const iconElem = existingWrapper.querySelector('.upload-item__img');
        iconElem.src = getIconForFileType(file.type);
    } else {
        //  doesn't exist -> create
        const uploadItem = document.createElement('div');
        uploadItem.className = 'upload-item';
        uploadItem.setAttribute('data-name', file.name);

        const content = document.createElement('div');
        content.className = 'upload-item__content';
        uploadItem.appendChild(content);

        const icon = document.createElement('img');
        icon.className = 'upload-item__img';
        icon.src = getIconForFileType(file.type);
        content.appendChild(icon);

        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'upload-item__name-time-wrapper';
        content.appendChild(itemWrapper);

        const name = document.createElement('p');
        name.className = 'upload-item__name';
        name.innerText = file.name;
        itemWrapper.appendChild(name);

        const time = document.createElement('p');
        time.className = 'upload-item__time';
        time.innerText = formatDate(new Date());
        itemWrapper.appendChild(time);

        const contentSize = document.createElement('div');
        contentSize.className = 'upload-item__content-size';
        uploadItem.appendChild(contentSize);

        const size = document.createElement('p');
        size.className = 'upload-item__size';
        size.innerText = formatBytes(file.size);
        contentSize.appendChild(size);

        const btn = document.createElement('button');
        btn.className = 'upload-item__btn';
        contentSize.appendChild(btn);

        uploadsList.appendChild(uploadItem);
    }

    showTab('recent');
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
// Function to format date
function formatDate(timestamp) {
    const milliseconds = new Date().getTime() - timestamp.getTime();
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);


    // if (days > 0) {
    //     return `${days} ${days > 1 ? 'days' : 'day'} ago`;
    // } else if (hours > 0) {
    //     return `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
    // } else if (minutes > 0) {
    //     return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
    // } else {
    //     return `${seconds} ${seconds > 1 ? 'seconds' : 'second'} ago`;
    // }
    let result;
    switch (true) {
        case days > 0:
            result = `${days} ${days > 1 ? 'days' : 'day'} ago`;
            break;
        case hours > 0:
            result = `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
            break;
        case minutes > 0:
            result = `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
            break;
        default:
            result = `${seconds} ${seconds > 1 ? 'seconds' : 'second'} ago`;
            break;
    }
    return result;

}





// Upload file to data
async function uploadFileToDatabase(file) {
    const docRef = await addDoc(fileCollectionRef, {
        name: file.name,
        size: file.size,
        type: file.type,
        date: new Date(),
    });
    const ref = docRef.id;
    return docRef;
}



// format file size 
// function formatFileSize(bytes) {
//     const units = ["B", "KB", "MB", "GB", "TB"];
//     let size = bytes;
//     let unitIndex = 0;
//     while (size >= 1024 && unitIndex < units.length - 1) {
//         size /= 1024;
//         unitIndex++;
//     }
//     return size.toFixed(1) + " " + units[unitIndex];
// }


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

// }






async function handleViewAll() {
    // get uploads from database
    const filesQuery = query(collection(db, "files"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(filesQuery);
    const allUploads = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const file = { name: data.name, size: formatBytes(data.size), time: formatDate(data.date.toDate()) };
        allUploads.push(file);
    });
    // Clear recent/add all uploads
    recentUploadsList.innerHTML = '';
    recentUploadsList.innerHTML = allUploads.map(file => `<div class="upload-item"><div class="upload-item__content"><img class="upload-item__img" src="${getIconForFileType(file.type)}"><div class="upload-item__name-time-wrapper"><p class="upload-item__name">${file.name}</p><p class="upload-item__time">${file.time}</p></div></div><div class="upload-item__content-size"> <p class="upload-item__size">${file.size}</p><button class="upload-item__btn"></button></div></div>`).join('');
}



//Recent files when recent tab is downloaded
window.addEventListener('load', async () => {
    await getRecentUploads();
});




// Get last upload time
async function getLastUploadTime() {
    const filesQuery = query(collection(db, "files"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(filesQuery);
    if (querySnapshot.size > 0) {
        const lastUploadTime = querySnapshot.docs[0].data().date.toDate();
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - lastUploadTime.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));

        let result;
        //     if (minutesDiff === 0) {
        //         return 'just now';
        //     } else if (minutesDiff === 1) {
        //         return '1 minute ago';
        //     } else if (minutesDiff < 60) {
        //         return `${minutesDiff} minutes ago`;
        //     } else if (minutesDiff < 1440) {
        //         const hoursDiff = Math.floor(minutesDiff / 60);
        //         return `${hoursDiff} hour${hoursDiff === 1 ? '' : 's'} ago`;
        //     } else {
        //         const daysDiff = Math.floor(minutesDiff / 1440);
        //         const dateStr = lastUploadTime.toLocaleDateString();
        //         const timeStr = lastUploadTime.toLocaleTimeString();
        //         return `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago on ${dateStr} at ${timeStr}`;
        //     }
        // } else {
        //     return 'never';
        const hoursDiff = Math.floor(minutesDiff / 60);
        switch (true) {
            case minutesDiff === 0:
                result = 'just now';
                break;
            case minutesDiff === 1:
                result = '1 minute ago';
                break;
            case minutesDiff < 60:
                result = `${minutesDiff} minutes ago`;
                break;
            case minutesDiff < 1440:
                result = `${hoursDiff} hour${hoursDiff === 1 ? '' : 's'} ago`;
                break;
            default:
                const daysDiff = Math.floor(minutesDiff / 1440);
                const dateStr = lastUploadTime.toLocaleDateString();
                const timeStr = lastUploadTime.toLocaleTimeString();
                result = `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago on ${dateStr} at ${timeStr}`;
        }
        return result;
    }
}


// Show last upload time
async function showLastUploadTime() {
    const lastUploadTime = await getLastUploadTime();
    const lastUploadEl = document.getElementById('time-synced');
    lastUploadEl.textContent = lastUploadTime;

}
showLastUploadTime();


