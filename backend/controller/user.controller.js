import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
export const getSuggestedConnections = async(req , res)=>{
    try{
        const currentUser = await User.findById(req.user._id).select("connections");
        //find users who are not already connected and also do not recommend our own profile
        const suggestedUser = await User.find({
            _id : {
                $ne: req.user._id,
                $nin: currentUser.connections
            }   
        }).select("name username profilePicture headline").limit(3);
        res.json(suggestedUser);
    } catch(error){
        return res.status(500).json({message : "Server Error"});
    }
};


export const getPublicProfile = async(req,res)=>{
    try{
        const requestedUsername = req.params.username.trim();
        const requesteduser = await User.findOne({requestedUsername}).select("-password");
        if(!requesteduser){
            return res.status(404).json({message : "User Not found"});
        }
        res.json(requesteduser);
    } catch(error){
        return res.status(500).json({message : "Server Error"});
    }

};

export const updateProfile = async(req,res)=>{
    try{
        const allowedFields = [
            "name",
			"username",
			"headline",
			"about",
			"location",
			"profilePicture",
			"bannerImg",
			"skills",
			"experience",
			"education",
        ]
        const updatedData = {};
        for(const field of allowedFields){
            if(req.body[field]){
                updatedData[field] = req.body[field];
            }
        }
        if(req.body.profilePicture){
            const result = await cloudinary.uploader.upload(req.body.profilePicture);
            //this will return a object containing secure_url of the image; 
            updatedData.profilePicture = result.secure_url;
        }
        if(req.body.bannerImg){
            const res = await cloudinary.uploader.upload(req.body.bannerImg);
            updatedData.bannerImg = res.secure_url;
        }
        //todo: check for the profile image and banner image => uploaded to cloudinary

        const user = await User.findOneAndUpdate(req.user._id,{$set: updatedData},{new : true}).select("-password");
        
        res.json(user);
    } catch(error){
        return res.status(500).json({message: "Internal Server Error"});
    }
};