const bcrypt = require('bcryptjs')
const User = require("../model/User");
const jwt = require('jsonwebtoken')
const JWT_SECRET_KEY ="MyKey";

const signup = async(req,res,next) => {
    const {name,email,password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
       return console.log(err);
    }
    if(existingUser) {
        return res.status(400).json({ message: "User Already exists! Login Instead"})
    }
    user = new User({
        name,
        email,
        password,
      });
  
      const salt = await bcrypt.genSalt(10);
  
      user.password = await bcrypt.hash(password, salt);

  
      const payload = {
        user: {
          id: user.id,
          name: user.name,
        }
      } 
 

    try {
      await user.save(); 
    } catch (err) {
      return  console.log(err)
    }
    return res.status(201).json({ user})

}

const login = async(req,res,next) =>{
    const {email,password} = req.body
    let existingUser;
    try {
        existingUser = await User.findOne({email})
    } catch (err) {
       return console.log(err);
    }
    if(!existingUser) {
        return res.status(404).json({ message: "Couldn't find user by this password"})
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }
    const token = jwt.sign({id: existingUser._id},JWT_SECRET_KEY, {
       expiresIn: "1hr"
      });
    return res.status(200).json({message: "Login Successful", user:existingUser, token})

   
}

module.exports = { signup, login};