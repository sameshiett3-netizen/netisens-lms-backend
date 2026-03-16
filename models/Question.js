const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    courseCode: { type: String, required: true },
    questionText: { type: String, required: true },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },
    correctAnswer: { type: String, required: true } // Will store 'A', 'B', 'C', or 'D'
});

module.exports = mongoose.model('Question', questionSchema);