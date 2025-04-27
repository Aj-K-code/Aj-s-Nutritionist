// DOM Elements
const foodForm = document.getElementById('food-form');
const foodNameInput = document.getElementById('food-name');
const foodDescriptionInput = document.getElementById('food-description');
const foodImageInput = document.getElementById('food-image');
const imagePreview = document.getElementById('image-preview');
const fileNameDisplay = document.getElementById('file-name');
const mealTimeInput = document.getElementById('meal-time');
const loadingElement = document.getElementById('loading');
const successMessage = document.getElementById('success-message');
const formSection = document.getElementById('form-section');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const btnSpinner = document.querySelector('.submit-btn .spinner');

// Set default date-time to current time
function setDefaultDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    mealTimeInput.value = formattedDateTime;
}

// Initialize the form
function initForm() {
    setDefaultDateTime();
    
    // Image preview functionality
    foodImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                fileNameDisplay.textContent = file.name;
                
                // Add animation to the preview
                imagePreview.classList.add('animate__animated', 'animate__fadeIn');
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
            fileNameDisplay.textContent = 'No file selected';
        }
    });
    
    // Form submission
    foodForm.addEventListener('submit', handleFormSubmit);
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!isAuthorized) {
        alert('Please sign in with Google first');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Get form values
        const foodName = foodNameInput.value;
        const foodDescription = foodDescriptionInput.value;
        const mealTime = mealTimeInput.value;
        const imageFile = foodImageInput.files[0];
        
        if (!imageFile) {
            throw new Error('Please select an image');
        }
        
        // Upload image to Google Drive
        const imageUrl = await uploadImageToDrive(imageFile);
        
        // Add data to Google Sheet
        await addDataToSheet(foodName, foodDescription, mealTime, imageUrl);
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        resetForm();
    } catch (error) {
        console.error('Error submitting form:', error);
        alert(`Error: ${error.message || 'Something went wrong'}`);
    } finally {
        setLoadingState(false);
    }
}

// Upload image to Google Drive
async function uploadImageToDrive(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
            const fileData = reader.result;
            
            // Create a blob from the array buffer
            const blob = new Blob([fileData], {type: file.type});
            
            // Get the file metadata
            const metadata = {
                name: `food_${Date.now()}_${file.name}`,
                mimeType: file.type,
                parents: [FOLDER_ID]
            };
            
            try {
                // Create a new multipart request
                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
                form.append('file', blob);
                
                // Get the access token
                const token = gapi.auth.getToken().access_token;
                
                // Upload the file
                const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: new Headers({'Authorization': 'Bearer ' + token}),
                    body: form
                });
                
                const result = await response.json();
                
                if (result.id) {
                    // Create a shareable link
                    const shareableLink = `https://drive.google.com/uc?id=${result.id}`;
                    resolve(shareableLink);
                } else {
                    reject(new Error('Failed to upload image'));
                }
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
    });
}

// Add data to Google Sheet
async function addDataToSheet(foodName, foodDescription, mealTime, imageUrl) {
    const timestamp = new Date().toISOString();
    const formattedDate = new Date(mealTime).toLocaleString();
    
    const values = [
        [timestamp, foodName, foodDescription, formattedDate, imageUrl]
    ];
    
    const request = {
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A:E',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: values
        }
    };
    
    try {
        const response = await gapi.client.sheets.spreadsheets.values.append(request);
        return response;
    } catch (error) {
        console.error('Error adding data to sheet:', error);
        throw error;
    }
}

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        btnText.textContent = 'Saving...';
        btnSpinner.classList.remove('hidden');
        submitBtn.disabled = true;
    } else {
        btnText.textContent = 'Save Entry';
        btnSpinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Show success message
function showSuccessMessage() {
    formSection.classList.add('hidden');
    successMessage.classList.remove('hidden');
    successMessage.classList.add('animate__fadeIn');
    
    // Reset after 3 seconds
    setTimeout(() => {
        successMessage.classList.add('hidden');
        formSection.classList.remove('hidden');
    }, 3000);
}

// Reset form
function resetForm() {
    foodForm.reset();
    imagePreview.style.display = 'none';
    fileNameDisplay.textContent = 'No file selected';
    setDefaultDateTime();
}

// Initialize when the page loads
window.addEventListener('load', initForm);
