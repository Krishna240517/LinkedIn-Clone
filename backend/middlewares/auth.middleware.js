import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies['jwt-linkedIN'];
        if (!token) {
            return res.status(200).json({
                success: false,
                message: "Token not found"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(200).json({
                success: false,
                message: "Unauthorized"
            })
        }
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(200).json({
                success: false,
                message: "User not found"
            })
        }
        req.user = user;
        next();
    } catch(error){
        console.log("Error in auth middleware", error);
        return res.status(501).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}