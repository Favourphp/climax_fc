const bcrypt = require('bcryptjs')
const User = require("../model/User");
const jwt = require('jsonwebtoken')
const JWT_SECRET_KEY ="MyKey";

const signup = async(req,res,next) => {
    const {name,email,password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email:email})
    } catch (err) {
       return console.log(err);
    }
    if(existingUser) {
        return res.status(400).json({ message: "User Already exists! Login Instead"})
    }
    const hashedPassword = bcrypt.hashSync(password)
    user = new User({
        name,
        email,
        password: hashedPassword,
      });
  

    try {
      await user.save(); 
    } catch (err) {
      return  console.log(err)
    }
    return res.status(201).json({ message: user})

}

const login = async(req,res,next) =>{
    const {email,password} = req.body
    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
       return new Error(err);
    }
    if(!existingUser) {
        return res.status(400).json({ message: "Couldn't find user by this password"})
    }

    const isPasswordCorrect = await bcrypt.compareSync(password, existingUser.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect Password" });
    }
    const token = jwt.sign({id: existingUser._id},JWT_SECRET_KEY, {
       expiresIn: "30s"
      });

res.cookie(String(existingUser._id),token, {
  path: '/',
  expires: new Date(Date.now()  + 1000 * 30),
  httpOnly: true,
  sameSite: 'lax',
})

    return res.status(200).json({message: "Login Successful", user:existingUser, token})

    }


   const verifyToken = (req, res, next) => {
    const cookies = req.headers.cookie
    const token = cookies.split("=")[1]
    console.log(token);
    
      // Check if not token
      if (!token) {
        return res.status(404).json({ msg: 'No token found' });
      }
    
 jwt.verify(String(token),JWT_SECRET_KEY,(err,user) => {
  if(err) {
   return res.status(400).json({message:"invalid token"})
  }
  console.log(user.id)
       req.id = user.id
 })
 next()
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
    return res.status(404).json({message:"User Not Found"})
  }
  return res.status(200).json({user})
 }


module.exports = { signup, login, verifyToken, getUser};
