const bcrypt = require('bcryptjs')
const User = require("../model/User");
const jwt = require('jsonwebtoken')
const JWT_SECRET_KEY ="MyKey";

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
  
      user.password = await bcrypt.hashSync(password, salt);

  
    
       
 

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

    const isMatch = await bcrypt.compareSync(password, existingUser.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }
    const token = jwt.sign({id: existingUser._id},JWT_SECRET_KEY, {
       expiresIn: "1hr"
      });
    return res.status(200).json({message: "Login Successful", user:existingUser, token})

    }


   const verifyToken = async function(req, res, next) {
      // Get token from header
      const authHeader = req.header('Authorization');
      const token = authHeader.split(' ')[1];
    
      // Check if not token
      if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
      }
    
  try {
    await jwt.verify(token, JWT_SECRET_KEY, (error, decoded) => {
      if (error) {
        res.status(401).json({ msg: 'Token is not valid' });
      } else {
        req.user = decoded.user;
      }
       console.log(user.id)
       req.id = user.id
    });
  } catch (err) {
   console.error('something wrong with auth middleware');
    res.status(500).json({ msg: 'Server Error' });
  }
};



const getUser = async (req, res, next) => {
  const userId = req.id
  let user
  try {
    user = await User.findById(userId, "-password")
  } catch (err) {
    return new Error(err)
  }
  if(!user){
    return res.status(400).json({message:"User Not Found"})
  }
  return res.status(200).json({user})
}


module.exports = { signup, login, verifyToken, getUser};
