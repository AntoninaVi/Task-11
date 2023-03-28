// // Initialize Firebase
// firebase.initializeApp({
//     // Your Firebase configuration
//   });

// Get references to DOM elements
const tabButtons = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadsList = document.getElementById('uploads');
const recentUploadsList = document.getElementById('recent-uploads');
const viewAllButton = document.getElementById('view-all-btn');

// Set up event listeners
tabButtons.forEach(button => button.addEventListener('click', handleTabClick));
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
viewAllButton.addEventListener('click', handleViewAll);
//   getRecentUploads();
// Show the New Upload tab by default
showTab('new-upload');

// Handle tab clicks
function handleTabClick(event) {
    const tab = event.target.dataset.tab;
    showTab(tab);
}

// Show the specified tab and hide the others
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

// Handle drag over events on the drop zone
function handleDragOver(event) {
    event.preventDefault();
    dropZone.classList.add('dragover');
}

// Handle drag leave events on the drop zone
function handleDragLeave(event) {
    event.preventDefault();
    dropZone.classList.remove('dragover');
}

// Handle drop events on the drop zone
function handleDrop(event) {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files;
    handleFiles(files);
}

// Handle file select events on the file input
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
        // Add the file to the uploads list
        addUploadToList(file);
        // Upload the file to the database
        uploadFile(file);
    }
    // Clear the file input
    fileInput.value = '';
}
// Function to handle file selection from the drop zone
function handleFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleFiles(files);
}

// Function to add a file to the uploads list
function addUploadToList(file) {
    const uploadsList = document.getElementById('uploads');
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
    uploadsList.appendChild(uploadItem);
}

// Function to format bytes to a human-readable string
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



//   Storage
// Function to upload a file to the database
async function uploadFileToDatabase(file) {
    // Create a reference to the storage location in Firebase
    const storageRef = firebase.storage().ref().child(file.name);

    try {
        // Upload the file to the storage location
        const snapshot = await storageRef.put(file);

        // Get the download URL of the uploaded file
        const downloadURL = await snapshot.ref.getDownloadURL();

        // Save the file metadata to Firestore
        await firebase.firestore().collection("uploads").add({
            name: file.name,
            size: file.size,
            created_at: new Date(),
            downloadURL: downloadURL
        });

        // Return the download URL of the uploaded file
        return downloadURL;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Function to display a file in the Recent tab
function displayFile(file) {
    const recentUploads = document.querySelector("#recent-uploads");

    // Create a new file element
    const fileElem = document.createElement("div");
    fileElem.classList.add("file");

    // Add the file name to the element
    const nameElem = document.createElement("p");
    nameElem.classList.add("name");
    nameElem.textContent = file.name;
    fileElem.appendChild(nameElem);

    // Add the file size to the element
    const sizeElem = document.createElement("p");
    sizeElem.classList.add("size");
    sizeElem.textContent = formatFileSize(file.size);
    fileElem.appendChild(sizeElem);

    // Add the file upload time to the element
    const timeElem = document.createElement("p");
    timeElem.classList.add("time");
    timeElem.textContent = formatTimeAgo(file.created_at);
    fileElem.appendChild(timeElem);

    // Add the file download button to the element
    const downloadElem = document.createElement("a");
    downloadElem.classList.add("download");
    downloadElem.textContent = "Download";
    downloadElem.href = file.downloadURL;
    downloadElem.setAttribute("download", file.name);
    fileElem.appendChild(downloadElem);

    // Add the file element to the Recent uploads container
    recentUploads.insertBefore(fileElem, recentUploads.firstChild);

    // Remove the oldest file from the Recent uploads container
    const fileElems = recentUploads.querySelectorAll(".file");
    if (fileElems.length > 5) {
        recentUploads.removeChild(fileElems[fileElems.length - 1]);
    }
}

// Function to format file size in human-readable format
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

// Function to format time ago in human-readable format
function formatTimeAgo(date) {
    const elapsed = (new Date() - date) / 1000;
    if (elapsed < 60) {
        return Math.round(elapsed) + " seconds ago";
    } else if (elapsed < 3600) {
        return Math.round(elapsed / 60) + " minutes ago";
    } else if (elapsed < 86400) {
        return Math.round(elapsed / 3600) + " hours ago";
    } else {
        return Math.round(elapsed / 86400) + " days ago";
    }
}





//   Show Uploads
function handleViewAll() {
    // Clear the uploads container
    const uploadsContainer = document.querySelector("#uploads");
    uploadsContainer.innerHTML = "";

    // Show the "loading" message
    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "Loading uploads...";
    uploadsContainer.appendChild(loadingMessage);

    // Fetch all uploads from Firestore
    db.collection("uploads")
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            // Remove the "loading" message
            uploadsContainer.innerHTML = "";

            // Loop through each upload and create a new element for it
            querySnapshot.forEach((doc) => {
                const upload = doc.data();
                const uploadElement = createUploadElement(upload);
                uploadsContainer.appendChild(uploadElement);
            });
        })
        .catch((error) => {
            console.log(error);
            uploadsContainer.innerHTML = "<p>Error loading uploads</p>";
        });
}
