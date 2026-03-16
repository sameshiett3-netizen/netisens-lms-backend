const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    instructor: {
        type: String,
        required: true
    },
    previewLink: {
        type: String,
        required: true
    },
    downloadLink: {
        type: String,
        required: true
    },
    pqLink: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', courseSchema);