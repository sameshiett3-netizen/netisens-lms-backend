const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: { 
        type: String, 
        required: true,
        unique: true // Prevents uploading the same course twice
    },
    title: { 
        type: String, 
        required: true 
    },
    instructor: { 
        type: String, 
        required: true 
    },
    materialLink: { 
        type: String, 
        required: true // Link to your Year 3 PDF materials
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Course', courseSchema);