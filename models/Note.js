const mongoose = require('mongoose');
const User = require('./User');
const { Schema } = mongoose;

const NoteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true,
    },
    tag: {
        type: String, 
        default: "General"
    },
    date: {
        type: Date, 
        default: Date.now 
    }
  
});

const Note = mongoose.model('note', NoteSchema);

Note.createIndexes();

module.exports = Note;