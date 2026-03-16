// ==========================================
// 1. AUTHENTICATION LOGIC (Runs on index.html)
// ==========================================
if (document.getElementById('authForm')) {
    let isLoginMode = true; 

    const nameBox = document.getElementById('nameBox');
    const authName = document.getElementById('authName');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    // Toggle to Register Mode
    showRegisterBtn.addEventListener('click', () => {
        isLoginMode = false;
        nameBox.style.display = "block";
        authName.required = true;
        formTitle.innerText = "Create an Account";
        submitBtn.innerText = "Sign Up";
        submitBtn.style.background = "#007bff";
        showRegisterBtn.style.background = "#007bff";
        showRegisterBtn.style.color = "white";
        showLoginBtn.style.background = "#e2e3e5";
        showLoginBtn.style.color = "black";
        forgotPasswordLink.style.display = "none";
    });

    // Toggle to Login Mode
    showLoginBtn.addEventListener('click', () => {
        isLoginMode = true;
        nameBox.style.display = "none";
        authName.required = false;
        formTitle.innerText = "Secure Login";
        submitBtn.innerText = "Login to Dashboard";
        submitBtn.style.background = "#28a745";
        showLoginBtn.style.background = "#007bff";
        showLoginBtn.style.color = "white";
        showRegisterBtn.style.background = "#e2e3e5";
        showRegisterBtn.style.color = "black";
        forgotPasswordLink.style.display = "block";
    });

    // Handle Form Submit (Login or Register)
    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = authName.value;
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;

        if (isLoginMode) {
            // LOGIN REQUEST
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json(); 
                    alert(data.message); 
                    
                    // THE DIGITAL WALLET: Save JWT token to browser storage
                    localStorage.setItem('lmsToken', data.token);

                    // Decode JWT to find the user's role so we know where to send them
                    const base64Url = data.token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    
                    const payload = JSON.parse(jsonPayload);

                    // Teleport user based on role
                    if (payload.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    alert(await response.text());
                }
            } catch (error) {
                alert("Server connection failed.");
            }
        } else {
            // REGISTER REQUEST
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                alert(await response.text()); 
                if (response.ok) {
                    showLoginBtn.click(); // Automatically switch back to login view so they can log in
                }
            } catch (error) {
                alert("Server connection failed.");
            }
        }
    });
}

// ==========================================
// 2. ADMIN UPLOAD LOGIC (Runs on admin.html)
// ==========================================
if (document.getElementById('adminCourseForm')) {
    
    // --- THE FRONTEND BOUNCER ---
    const token = localStorage.getItem('lmsToken');
    if (!token) {
        alert("Access Denied. Please log in.");
        window.location.href = 'index.html'; // Kick to login
    } else {
        // Decode the token to check their role
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));

        if (payload.role !== 'admin') {
            alert("Security Alert: You do not have Admin privileges.");
            window.location.href = 'dashboard.html'; // Kick back to student area
        }
    }
    // -----------------------------

    document.getElementById('adminCourseForm').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const payload = {
            courseCode: document.getElementById('courseCode').value,
            title: document.getElementById('courseTitle').value,
            instructor: document.getElementById('instructorName').value,
            previewLink: document.getElementById('previewLink').value, 
            downloadLink: document.getElementById('downloadLink').value, 
            pqLink: document.getElementById('pqLink').value
        };
        try {
            const response = await fetch('/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            alert(await response.text());
            document.getElementById('adminCourseForm').reset(); 
        } catch (error) {
            alert("Server error uploading the course.");
        }
    });
}

// ==========================================
// 3. STUDENT FETCH LOGIC (Runs on dashboard.html)
// ==========================================
if (document.getElementById('loadCoursesBtn')) {
    document.getElementById('loadCoursesBtn').addEventListener('click', async () => {
        try {
            const response = await fetch('/courses'); 
            const courses = await response.json();
            const courseList = document.getElementById('courseList');
            courseList.innerHTML = ''; 

            if (courses.length === 0) {
                courseList.innerHTML = '<p>No courses available yet.</p>';
                return;
            }

            courses.forEach(course => {
                const courseCard = `
                    <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 5px; background-color: #f9f9f9; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <h3 style="margin-top: 0; color: #333;">${course.courseCode}: ${course.title}</h3>
                        <p style="color: #666;"><strong>Instructor:</strong> ${course.instructor}</p>
                        <div style="margin-top: 15px;">
                            <a href="${course.previewLink}" target="_blank"><button style="margin-right: 10px; padding: 8px 12px; cursor: pointer; background: #e2e3e5; border: 1px solid #ccc; border-radius: 4px;">📁 Open Folder</button></a>
                            <a href="${course.downloadLink}" target="_blank"><button style="margin-right: 10px; padding: 8px 12px; cursor: pointer; background: #e2e3e5; border: 1px solid #ccc; border-radius: 4px;">📄 Download Note</button></a>
                            <a href="${course.pqLink}" target="_blank"><button style="padding: 8px 12px; cursor: pointer; background: #e2e3e5; border: 1px solid #ccc; border-radius: 4px;">🗂️ Past Questions</button></a>
                        </div>
                    </div>
                `;
                courseList.innerHTML += courseCard;
            });
        } catch (error) {
            alert("Error loading courses from database.");
        }
    });
}