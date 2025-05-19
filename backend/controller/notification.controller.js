import Notification from "../models/notrification.model.js";

export const getUserNotifications = async(req,res)=>{
    try{
        const notifications = await Notification.find({recipient: req.user._id})
        .sort({createdAt : -1})
        .populate("relatedUser","name username profilePicture")
        .populate("relatedPost","content image")

        res.status(200).json(notifications);
    } catch(error){
        console.log("ERROR IN READING NOTIFICATIONS");
        return res.status(500).json({message : "Internal Server Error"});
    }
}


export const markNotificationAsRead = async( req, res )=>{
        const notificationId = req.params.id;
        try{
            const notification = await Notification.findByIdAndUpdate({_id: notificationId,recipient:  req.user._id},{
                read : true
            },{new : true});
            res.json(notification);
            
        } catch(error){
            console.log("ERROR IN NOTIFICATION READING");
            return res.status(500).json("Internal Server Error");
        }
}

export const deleteNotification = async(req,res)=>{
    const notificationId = req.params.id;

    try{
        await Notification.findOneAndDelete({_id: notificationId, recipient: req.user._id});
        res.status(200).json({message : "Notification Deleted Successfully"});
    } catch(error){
        console.log("Error in deleting the notification")
        return res.status(500).json("Internal Server Error");
    }
}