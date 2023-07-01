const bcrypt = require('bcrypt')
const User = require("../model/User");

const getAllUser = async(req,res,next) => {
    let users;
    try {
        users = await User.find();
    } catch (err) {
        console.log(err)
    }
    if (!users) {
        return res.status(404).json({ message: "No User Found"})
    }
    return res.status(200).json({users })
}
const signup = async(req,res,next) => {
    const {name,email,password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email})
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
    return res.status(200).json({message: "Login Successful"})

   
}

module.exports = {getAllUser, signup, login};