const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "Speci@lSecr5t";
const authUser  = require('../middleware/authUser')

router.post('/create', [
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'name should be at least 3 characters').isLength({ min: 3 }),
    body('password', 'password should be at least 3 characters').isLength({ min: 3 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try{
      let salt = await bcrypt.genSaltSync(10);
      let pass = await bcrypt.hashSync(req.body.password, salt);
      //waiting for checking existing user 
      let user = await User.findOne({ email: req.body.email });
      if(user){
        return res.status(400).send({error: "this email is already exist!"});
      }
  
      //storing user and waiting for getting this done
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: pass,
        type: req.body.type,
      });
      const data = { user : {
        id: user.id,
        type: user.type
      }};
      const authToken = jwt.sign(data, JWT_SECRET);
      return res.json(authToken);
    }catch(error){
      return res.status(400).json(error.message);
    }
});

// authenticate an user 
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({email: req.body.email})
    if(!user){
      return res.status(400).json({"error" : "credential's doesen.t match"})
    }
    const {email, password} = req.body;
    const comparePassword = await bcrypt.compare(password, user.password);
    if(!comparePassword){
      return res.status(400).json({"error" : "credential's doesen.t match"});
    }
    const data = { user : {
      id: user.id,
      type: user.type
    }};
    const authToken = jwt.sign(data, JWT_SECRET);
    return res.json(authToken);
  }catch(error){
    // console.log(error.message);
    return res.status(500).send("Internal server error");
  }
});

// getting a user
router.get('/:id', authUser, async (req, res) => {
  try {
      const user = await User.findById(req.params.id).select("-password");
      if(user.id == req.user.id || req.user.type == 'Admin'){
          return res.status(500).json(user);
      }else{
          return res.status(401).json({error: "You are not authorized"})
      }

  } catch (error) {
      return res.status(400).json(error.message);
  }
});

// updating user
router.patch('/:id', [
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'name should be at least 3 characters').isLength({ min: 3 }),
    body('password', 'password should be at least 3 characters').isLength({ min: 3 }),
  ],authUser, async (req, res) => {
  try {
      const {name, email, password, type} = req.body;
      let pass = null;
      if(password){
        let salt = await bcrypt.genSaltSync(10);
        pass = await bcrypt.hashSync(password, salt);
      }
      const user = await User.findById(req.params.id);
      if(user.id == req.user.id || req.user.type == 'Admin'){
          if(name) user.name = name;
          if(email) user.email = email;
          if(pass) user.password = pass;
          if(type) user.type = type;
          await user.save();
          return res.status(500).json({message: "successfully updated!"});
      }else{
          return res.status(401).json({error: "You are not authorized"})
      }
  } catch (error) {
      return res.status(400).json({error: "Error"})
  }
});

// getting all user
router.get('/', authUser, async (req, res) => {
  try {
      let users = {};
      // checking if admin then get all records else get records that are created by logged in user
      if(req.user.type == 'Admin'){
          users = await User.find();
      }else{
          users = await User.find({user: req.user.id});
      }
      return res.status(500).json(users);

  } catch (error) {
      return res.status(400).json(error.message);
  }
});

// delete a user
router.delete('/:id', authUser, async (req, res) => {
  try {
      const user = await User.findByIdAndDelete(req.params.id);
      if(user){
          return res.status(500).json({message: "successfully updated!"});
      }else{
          return res.status(401).json({error: "You are not authorized"})
      }

  } catch (error) {
      return res.status(400).json(error.message);
  }
});


router.get('/getUser', authUser, async (req, res) => {
  try {
    const data = await User.findById(req.user.id).select("-password");
    // console.log(data);
    return res.send(data);
  } catch (error) {
    return res.status(400).json({error: "Something went wrong!"});
  }
});

module.exports = router;