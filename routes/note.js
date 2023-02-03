const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');
const authUser  = require('../middleware/authUser');

// creating new note
router.post('/create', [
    body('title', 'Enter a Ttile for Note'),
    body('description', 'Enter a Description for Note'),
], authUser, async (req, res) => {
    // checking validation for note field
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {title, description, tag} = req.body;
        const note = await Note.create({
            title: title,
            description: description,
            tag: tag,
            user: req.user.id
        });
        if(note){
            return res.status(200).json({message: "Note has been saved successfully!"});
        }
    } catch (error) {
        return res.status(400).json({error});
    }
})

// getting all notes
router.get('/', authUser, async (req, res) => {
    try {
        let notes = {};
        // checking if admin then get all records else get records that are created by logged in user
        if(req.user.type == 'Admin'){
            notes = await Note.find();
        }else{
            notes = await Note.find({user: req.user.id});
        }
        return res.status(200).json(notes);

    } catch (error) {
        return res.status(400).json(error.message);
    }
});

// getting a note
router.get('/:id', authUser, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if(note.user == req.user.id || req.user.type == 'Admin'){
            return res.status(200).json(note);
        }else{
            return res.status(401).json({error: "You are not authorized"})
        }

    } catch (error) {
        return res.status(400).json(error.message);
    }
});

// updating note
router.patch('/:id', authUser, async (req, res) => {
    try {
        const {title, description, tag} = req.body;
        const note = await Note.findById(req.params.id);
        if(note.user == req.user.id || req.user.type == 'Admin'){
            note.title = title;
            note.description = description;
            note.tag = tag;
            await note.save();
            return res.status(200).json({message: "successfully updated!"});
        }else{
            return res.status(401).json({error: "You are not authorized"})
        }
    } catch (error) {
        return res.status(400).json({error: "Error"})
    }
});

// delete a note
router.delete('/:id', authUser, async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if(note){
            return res.status(200).json({message: "successfully deleted!", _id: note._id});
        }else{
            return res.status(401).json({error: "You are not authorized"})
        }

    } catch (error) {
        return res.status(400).json(error.message);
    }
});
  
module.exports = router;