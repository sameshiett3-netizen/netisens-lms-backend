//initialise .env to save sensitive data
require ('dotenv').config();
//import expressjs
const express = require('express');
//intialise the database(mongodb)                                                                                                                                                                                                       
const mongoose = require('mongoose')
//initialise the JWT
const jwt = require ('jsonwebtoken')
//initialise database user model
const User =require('./models/User')
//initialise course information
const Course = require('./models/Course');
//initialise question information
const Question = require('./models/Question')
//initialise the server
const app = express();
//initialise the password encryptor
const bcrypt = require ('bcryptjs');
//activate JSON reading capability
app.use(express.json());
//make sure public information is accessible to even non users
app.use(express.static('public'))

  app.post('/register',async(req,res) =>{
    try{
        //  Grab the data the student sent us
        const {name, email, password} = req.body;
        // Salt the password
        const salt = await bcrypt.genSalt(10);
        // mix the salt with the password
        const hashedpassword = await bcrypt.hash(password,salt);
        //  Feed it to build a new User
        const student = new User({
            name:name,
            email:email,
            password:hashedpassword,
        });
        // Save to database
        await student.save();
        // Send a success text back to the student
        res.send("Student succesfully registered in the LMS!")
    } 
    catch(error){
        //If email is missing or there is an error, it catches and displays it
        console.error("There is an error:", error);
        res.status(400).send("Registration failed. The email might already exist.");
    }
});
// STUDENT ROUTE: GET ALL COURSES
app.get('/courses', async (req, res) => {
    try {
        // This tells MongoDB to find all courses and sort them newest first
        const courses = await Course.find().sort({ createdAt: -1 }); 
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).send("Error fetching courses: " + error.message);
    }
});
// The VIP Bouncer (Middleware)
const verifyToken = (req, res, next) => {
    // 1. Look at the user's header for the wristband
    const token = req.header('Authorization');
    
    // 2. If they don't have one, kick them out
    if (!token) {
        return res.status(401).send("Access Denied. No ID Badge provided.");
    }

    try {
        // 3. Check the math on the badge (Verify the signature)
        // We use replace() to strip away the word "Bearer " that usually comes with tokens
        const cleanToken = token.replace("Bearer ", "");
        const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        // 4. If it's real, attach the user's payload to the request and let them pass!
        req.user = verified; 
        next(); 
        
    } catch (error) {
        // If the token is fake or expired, kick them out
        res.status(400).send("Invalid or expired token.");
    }
};
// Generic User Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check the ID (Find the user by email)
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).send("User not found. Please register first.");
        }

        // 2. Check the Handshake (Compare passwords)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Incorrect password.");
        }
        // 3. Success! Print the ID Badge (JWT)
        const token = jwt.sign(
            { userId: user._id, role: user.role }, // The Payload (Who is this?)
            process.env.JWT_SECRET,                // The Signature (The wax seal)
            { expiresIn: '30d' }                   // The Clock (Expires in 30 days)
        );

        // Hand the badge back to the user in a nice JSON package
        res.status(200).json({
            message: `Welcome back, ${user.name}!`,
            token: token
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Server error during login.");
    }
});
// A Protected Route (Only logged-in users can see this)
app.get('/dashboard', verifyToken, (req, res) => {
    // Because the Bouncer let them pass, we now have access to req.user!
    res.send(`Welcome to the VIP Lounge! Your hidden user ID is ${req.user.userId} and your role is ${req.user.role}.`);
});
//Port Configuration
const port =  process.env.port || 5000;
const dbstring = process.env.MONGO_URI;
mongoose.connect(dbstring)
        .then(()=>{
            console.log("Succesfully Connected to the Mongodb database");
        })
        .catch((error) =>{
            console.error("Failed to connect to the database, Error:", error);
        })
// ==========================================
// ADMIN ROUTE: UPLOAD A COURSE
app.post('/courses', async (req, res) => {
    try {
        // Now grabbing all 3 links from the front-end
        const { courseCode, title, instructor, previewLink, downloadLink, pqLink } = req.body;

        const newCourse = new Course({
            courseCode: courseCode,
            title: title,
            instructor: instructor,
            previewLink: previewLink,
            downloadLink: downloadLink,
            pqLink: pqLink  // <-- Added PQ Link
        });

        await newCourse.save();
        res.status(201).send(`Success! ${courseCode} has been added to the LMS.`);
        
    } catch (error) {
        res.status(500).send("Error uploading course: " + error.message);
    }
});

// ==========================================
// ADMIN ROUTE: DELETE A COURSE
// ==========================================
app.delete('/courses/:id', async (req, res) => {
    try {
        // 1. Grab the unique ID from the URL
        const courseId = req.params.id;

        // 2. Tell MongoDB to find this exact course and wipe it out
        const deletedCourse = await Course.findByIdAndDelete(courseId);

        // 3. If the database couldn't find it, let us know
        if (!deletedCourse) {
            return res.status(404).send("Course not found in the database.");
        }

        // 4. Success message
        res.status(200).send(`Success! ${deletedCourse.courseCode} has been permanently deleted.`);
        
    } catch (error) {
        res.status(500).send("Error deleting course: " + error.message);
    }
});
// ==========================================
// CBT ENGINE ROUTES
// ==========================================
// 1. Admin uploads a question
app.post('/questions', async (req, res) => {
    try {
        const newQuestion = new Question(req.body);
        await newQuestion.save();
        res.status(201).send("Question successfully added to the CBT Bank!");
    } catch (error) {
        res.status(500).send("Error saving question: " + error.message);
    }
});

// Bulk upload multiple questions at once
app.post('/questions/bulk', async (req, res) => {
    try {
        const questionsArray = req.body; // Expecting an array of questions
        
        // Safety check to ensure they actually sent an array
        if (!Array.isArray(questionsArray)) {
            return res.status(400).send("Error: Data must be a JSON array.");
        }

        // Mongoose command to insert multiple documents at once
        await Question.insertMany(questionsArray);
        res.status(201).send(`Massive Success! ${questionsArray.length} questions added to the Question Bank.`);
    } catch (error) {
        res.status(500).send("Error bulk saving questions: " + error.message);
    }
});

// 2. Student fetches a test by Course Code
app.get('/test/:courseCode', async (req, res) => {
    try {
        const courseCode = req.params.courseCode.toUpperCase();
        const questions = await Question.find({ courseCode: courseCode });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).send("Error fetching test: " + error.message);
    }
});

app.listen (port,(()=>{
    console.log(`The port is running and listening on port ${port}`);

    })  

        );
        