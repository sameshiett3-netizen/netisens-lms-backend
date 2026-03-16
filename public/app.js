// ==========================================
// 1. REGISTRATION LOGIC
// ==========================================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.text();
        alert(result); 
    } catch (error) {
        alert("Server error during registration.");
    }
});

// ==========================================
// 2. LOGIN LOGIC & DIGITAL WALLET
// ==========================================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json(); 
            
            // THE DIGITAL WALLET: Save the JWT token to the browser!
            localStorage.setItem('lmsToken', data.token); 
            
            alert(data.message + " Your VIP Token is saved!");
        } else {
            const errorText = await response.text();
            alert("Login Failed: " + errorText);
        }
    } catch (error) {
        alert("Server error during login.");
    }
});

// ==========================================
// 3. VIP DASHBOARD LOGIC (The Bouncer Test)
// ==========================================
document.getElementById('dashboardBtn').addEventListener('click', async () => {
    // 1. Dig into the digital wallet and grab the token
    const token = localStorage.getItem('lmsToken');

    // If the wallet is empty, stop them right here
    if (!token) {
        alert("Access Denied: You need to log in first!");
        return;
    }

    try {
        // 2. Knock on the VIP door and hold up the wristband
        const response = await fetch('/dashboard', {
            method: 'GET',
            headers: {
                // THIS IS THE CRITICAL LINE: Attaching the token to the header
                'Authorization': `Bearer ${token}` 
            }
        });

        // 3. Read what the server says (Success or Failure)
        const result = await response.text();
        alert(result)

    } catch (error) {
        alert("Server error connecting to the dashboard.");
    }
});
document.getElementById('adminCourseForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const courseCode = document.getElementById('courseCode').value;
    const title = document.getElementById('courseTitle').value;
    const instructor = document.getElementById('instructorName').value;
    const previewLink = document.getElementById('previewLink').value; // Grabs Folder
    const downloadLink = document.getElementById('downloadLink').value; // Grabs Download

    try {
        const response = await fetch('/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseCode, title, instructor, previewLink, downloadLink })
        });

        const result = await response.text();
        alert(result);

    } catch (error) {
        alert("Server error uploading the course.");
    }
});