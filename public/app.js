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
        
        // Claude's Active Tab Styling
        showRegisterBtn.style.background = "linear-gradient(135deg, var(--green-400), var(--green-600))";
        showRegisterBtn.style.color = "#fff";
        showRegisterBtn.style.boxShadow = "0 3px 10px rgba(34,168,96,.28)";
        
        // Claude's Inactive Tab Styling
        showLoginBtn.style.background = "transparent";
        showLoginBtn.style.color = "var(--text-soft)";
        showLoginBtn.style.boxShadow = "none";
        
        forgotPasswordLink.style.display = "none";
    });

    // Toggle to Login Mode
    showLoginBtn.addEventListener('click', () => {
        isLoginMode = true;
        nameBox.style.display = "none";
        authName.required = false;
        formTitle.innerText = "Secure Login";
        submitBtn.innerText = "Login to Dashboard";
        
        // Claude's Active Tab Styling
        showLoginBtn.style.background = "linear-gradient(135deg, var(--green-400), var(--green-600))";
        showLoginBtn.style.color = "#fff";
        showLoginBtn.style.boxShadow = "0 3px 10px rgba(34,168,96,.28)";
        
        // Claude's Inactive Tab Styling
        showRegisterBtn.style.background = "transparent";
        showRegisterBtn.style.color = "var(--text-soft)";
        showRegisterBtn.style.boxShadow = "none";
        
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
    
    // Add logic to clear the token when the student clicks Logout
    const logoutBtn = document.querySelector('.btn-logout');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('lmsToken');
        });
    }

    document.getElementById('loadCoursesBtn').addEventListener('click', async () => {
        try {
            const response = await fetch('/courses'); 
            const courses = await response.json();
            const courseList = document.getElementById('courseList');
            courseList.innerHTML = ''; 

            if (courses.length === 0) {
                courseList.innerHTML = '<div style="padding: 15px; color: var(--text-soft);">No courses available yet. Check back later!</div>';
                return;
            }

            courses.forEach(course => {
                // Upgraded to match Claude's glassmorphism UI!
                const courseCard = `
                    <div style="background: rgba(255,255,255,.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
                        <div style="border-bottom: 1.5px solid var(--green-100); padding-bottom: 12px; margin-bottom: 16px;">
                            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; color: var(--text-dark); margin: 0; display: flex; align-items: center; gap: 8px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(135deg, var(--green-400), var(--green-600)); display: inline-block;"></span>
                                ${course.courseCode}: ${course.title}
                            </h3>
                            <p style="margin: 6px 0 0 16px; font-size: 0.85rem; color: var(--text-soft); font-weight: 600; text-transform: uppercase;">Instructor: ${course.instructor}</p>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <a href="${course.previewLink}" target="_blank" style="text-decoration: none;"><button style="padding: 8px 16px; background: var(--green-50); color: var(--green-700); border: 1px solid var(--green-200); border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; font-size: 0.85rem;">📁 Open Folder</button></a>
                            <a href="${course.downloadLink}" target="_blank" style="text-decoration: none;"><button style="padding: 8px 16px; background: var(--green-50); color: var(--green-700); border: 1px solid var(--green-200); border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; font-size: 0.85rem;">📄 Download Note</button></a>
                            <a href="${course.pqLink}" target="_blank" style="text-decoration: none;"><button style="padding: 8px 16px; background: var(--green-50); color: var(--green-700); border: 1px solid var(--green-200); border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; font-size: 0.85rem;">🗂️ Past Questions</button></a>
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

// ==========================================
// 4. ADMIN COURSE MANAGEMENT & LOGOUT
// ==========================================
if (document.getElementById('loadAdminCoursesBtn')) {
    
    // Wire up Claude's Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('lmsToken'); // Empty the digital wallet
            window.location.href = 'index.html'; // Kick back to login screen
        });
    }

    // Fetch and display courses with a Delete button
    document.getElementById('loadAdminCoursesBtn').addEventListener('click', async () => {
        try {
            const response = await fetch('/courses');
            const courses = await response.json();
            const courseList = document.getElementById('adminCourseList');
            courseList.innerHTML = ''; // Clear the "Awaiting database load..." text

            if (courses.length === 0) {
                courseList.innerHTML = '<div style="padding: 15px; color: var(--text-soft);">No courses found in the database.</div>';
                return;
            }

            courses.forEach(course => {
                // Notice how we use Claude's CSS variables (var(--white), etc.) to make it match!
                const courseCard = `
                    <div style="border: 1px solid var(--border); padding: 16px; margin-bottom: 12px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: var(--white); box-shadow: var(--shadow-sm);">
                        <div>
                            <h4 style="margin: 0; color: var(--text-dark);">${course.courseCode}: ${course.title}</h4>
                            <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-soft);">Instructor: ${course.instructor}</p>
                        </div>
                        <button onclick="deleteCourse('${course._id}')" style="background: #ff5c6c; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">🗑️ Delete</button>
                    </div>
                `;
                courseList.innerHTML += courseCard;
            });
        } catch (error) {
            alert("Error loading courses from database.");
        }
    });
}

// Global Delete Function (Fired when the red button is clicked)
window.deleteCourse = async (courseId) => {
    // Built-in browser warning so you don't accidentally delete a course
    if (!confirm("Are you sure you want to permanently delete this course?")) return;
    
    try {
        const response = await fetch(`/courses/${courseId}`, { method: 'DELETE' });
        alert(await response.text());
        
        // Auto-click the Load button to refresh the UI immediately after deleting!
        document.getElementById('loadAdminCoursesBtn').click(); 
    } catch (error) {
        alert("Server error deleting course.");
    }
};

// ==========================================
// 5. CBT ENGINE LOGIC (Quiz Builder & Taker)
// ==========================================

// --- ADMIN: Add a question to the bank ---
if (document.getElementById('adminQuizForm')) {
    document.getElementById('adminQuizForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            courseCode: document.getElementById('quizCourseCode').value.toUpperCase(),
            questionText: document.getElementById('quizQuestion').value,
            optionA: document.getElementById('optA').value,
            optionB: document.getElementById('optB').value,
            optionC: document.getElementById('optC').value,
            optionD: document.getElementById('optD').value,
            correctAnswer: document.getElementById('correctAnswer').value.toUpperCase()
        };

        try {
            const response = await fetch('/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            alert(await response.text());
            document.getElementById('adminQuizForm').reset();
        } catch (error) {
            alert("Error saving question.");
        }
    });
}

// --- ADMIN: Bulk Import JSON Questions ---
if (document.getElementById('bulkQuizForm')) {
    document.getElementById('bulkQuizForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            // 1. Grab the raw text from the text area
            const rawText = document.getElementById('bulkJsonInput').value;
            
            // 2. Try to parse it into actual JSON to make sure it's valid
            const payload = JSON.parse(rawText);

            // 3. Send the array to our new bulk route
            const response = await fetch('/questions/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            alert(await response.text());
            document.getElementById('bulkQuizForm').reset();
            
        } catch (error) {
            // If JSON.parse fails, it means NotebookLM messed up the formatting
            alert("Format Error: Ensure you are pasting a valid JSON array. Check for missing quotes or commas!");
        }
    });
}

// --- STUDENT: Fetch and Take the Test ---
if (document.getElementById('startTestBtn')) {
    let currentQuizData = []; // Store the correct answers in memory

    document.getElementById('startTestBtn').addEventListener('click', async () => {
        const code = document.getElementById('testCourseCode').value.trim();
        if (!code) return alert("Please enter a course code first.");

        try {
            const response = await fetch(`/test/${code}`);
            const questions = await response.json();
            const testArea = document.getElementById('testArea');

            if (questions.length === 0) {
                testArea.innerHTML = `<div style="padding: 15px; color: var(--text-soft);">No questions found for ${code} yet.</div>`;
                return;
            }

            currentQuizData = questions; // Save for grading
            let quizHTML = `<form id="studentQuizForm" style="background: rgba(255,255,255,.88); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm);">`;
            
            questions.forEach((q, index) => {
                quizHTML += `
                    <div style="margin-bottom: 20px; border-bottom: 1px solid var(--green-50); padding-bottom: 15px;">
                        <p style="font-weight: bold; color: var(--text-dark); margin-bottom: 10px;">${index + 1}. ${q.questionText}</p>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="color: var(--text-mid); text-transform: none; font-weight: normal;"><input type="radio" name="q${index}" value="A" required> A) ${q.optionA}</label>
                            <label style="color: var(--text-mid); text-transform: none; font-weight: normal;"><input type="radio" name="q${index}" value="B"> B) ${q.optionB}</label>
                            <label style="color: var(--text-mid); text-transform: none; font-weight: normal;"><input type="radio" name="q${index}" value="C"> C) ${q.optionC}</label>
                            <label style="color: var(--text-mid); text-transform: none; font-weight: normal;"><input type="radio" name="q${index}" value="D"> D) ${q.optionD}</label>
                        </div>
                    </div>
                `;
            });

            quizHTML += `<button type="submit" class="btn-submit" style="width: 100%;">Submit Test & Get Score</button></form>`;
            testArea.innerHTML = quizHTML;

            // Handle the submission and grading
            document.getElementById('studentQuizForm').addEventListener('submit', (e) => {
                e.preventDefault();
                let score = 0;
                const formData = new FormData(e.target);
                
                currentQuizData.forEach((q, index) => {
                    const studentAnswer = formData.get(`q${index}`);
                    if (studentAnswer === q.correctAnswer) {
                        score++;
                    }
                });

                const percentage = Math.round((score / currentQuizData.length) * 100);
                testArea.innerHTML = `
                    <div style="background: var(--green-50); border: 2px solid var(--green-400); border-radius: var(--radius); padding: 30px; text-align: center;">
                        <h2 style="color: var(--text-dark); margin-bottom: 10px;">Test Complete!</h2>
                        <h1 style="color: var(--green-600); font-size: 3rem; margin: 0;">${percentage}%</h1>
                        <p style="color: var(--text-mid); margin-top: 10px;">You scored ${score} out of ${currentQuizData.length} correctly.</p>
                    </div>
                `;
            });

        } catch (error) {
            alert("Error loading the test.");
        }
    });
}