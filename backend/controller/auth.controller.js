import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
export const signup = async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        if (!name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        //search if the user already exists in the db
        const existingEmail = await User.findOne({ email });
        if(existingEmail){
            return res.status(400).json({success: false, message: "Email already Exists"})
        }
        const existingUserName = await User.findOne({ username });
        if(existingUserName){
            return res.status(400).json({success: false, message: "Username already Exists"})
        }


        //now we need to hash the password and store it in the db
        const hashPassword = await bcrypt.hash(password,10);

        const user = new User({
            name,
            username,
            password : hashPassword,
            email,
        })
        await user.save();
        

        //generate the token
        const token = jwt.sign({userId: user._id},process.env.JWT_SECRET);
        res.cookie("jwt-linkedIN",token,{
            httpOnly: true, //prevent XSS attack
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: "strict",
            secure : process.env.NODE_ENV ==="production",

        });
        
        res.status(201).json({success : true, message : "User registered Successfully"});
        const profileUrl = process.env.CLIENT_URL +"/profile/" + user.username;
        //todo: send welcome email
        try{
            await sendWelcomeEmail(user.email,user.name,profileUrl);
        } catch(error){
            console.log("Error in sending welcome email");
            return res.status(500).json({})
        }

    } catch(error){
        console.log("Error in signup: ",error.message);
        return res.status(500).json({success: false, message : "Internal Server Error"});
    }
};

export const login = async(req,res)=>{
    const { username, password } = req.body;
     try{
        if ( !username || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const userNameExists = await User.findOne({ username });
        if(!userNameExists){
            return res.status(200).json({
                success :  false,
                message : "User doesn't exist"
            })
        }

        //check password
        const decryptedPassword = await bcrypt.compare(password, userNameExists.password);
        if(!decryptedPassword){
            return res.status(200).json({
                success : false,
                message : "User doesn't exist"
            })
        }

        const token = jwt.sign({userId : userNameExists._id},process.env.JWT_SECRET);
        res.cookie("jwt-linkedIN",token,{
            httpOnly: true, //prevent XSS attack
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: "strict",
            secure : process.env.NODE_ENV ==="production",

        });
        res.status(201).json({success: true, message : "User Logged In Successfully"});
     } catch(error){
         console.log("Error in signin: ",error.message);
         return res.status(500).send("Internal Server Error");
     }
}

export const logout = async(req,res)=>{
    res.clearCookie("jwt-linkedIN");
    res.status(201).json({
        success : true,
        message : "User logged out successfully"
    })
}

export const getCurrentUser = (req,res)=>{
    try{
        res.json(user);
    } catch(error){
        console.log("Error in getCurrentUser: ",error.message);
        return res.status(500).send("Internal server error");
    }
}