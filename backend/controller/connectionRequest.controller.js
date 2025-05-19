import ConnectionRequest from "../models/connectionRequest.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notrification.model.js";


export const sendConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        const senderId = req.user._id;
        if (senderId.toString() === userId) {
            return res.status(400).json({ message: "You can't send a request to yourself" });
        }
        if (req.user.connections.include(userId)) {
            return res.status(400).json({ message: "You are already connected" });
        }

        const existingRequest = await ConnectionRequest.findOne({
            sender: senderId,
            recipient: userId,
            status: "pending",
        });
        if (existingRequest) {
            return res.status(400).json({ message: "A connection request already exists" });
        }

        const newRequest = new ConnectionRequest({
            sender: senderId,
            recipient: userId,
            status: "pending",
        });
        await newRequest.save();

        res.status(201).json({ message: "Connection Request Sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await ConnectionRequest.findById(requestId)
            .populate("sender", "name email username")
            .populate("recipient", "name username");

        if (!request) {
            return res.status(403).json({ message: "Request never found" });
        }

        //check if the req is for the current user
        //you cannot accept the request that is not for you
        if (request.recipient._id.toString() !== userId.toString()) {
            return res.status(400).json({ message: "Not authorized to accept the request" })
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "This request has been already processed" });
        }

        request.status = "accepted";
        await request.save();

        //if i'm you friend then you are also my friend
        await User.findByIdAndUpdate(request.sender._id, { $addToSet: { connections: userId } });
        await User.findByIdAndUpdate(userId, { $addToSet: { connections: request.sender._id } });

        const notification = new Notification({
            recipient: request.sender._id,
            type: "connectionAccepted",
            relatedUser: userId,
        });
        await notification.save();
        res.json({ message: "Connection Accepted Successfully" });
    } catch (error) {
        console.log("Error in accepting connection request");
        res.status(500).json({ message: "Server Error" });
    }
}

export const rejectConnectionRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await ConnectionRequest.findById(requestId);
        if (request.recipient.toString() !== userId.toString()) {
            res.status(403).json({ message: "Not authorized to reject this request" });
        }
        if (request.status !== "pending") {
            res.status(400).json({ message: "This request has been already processed" });
        }
        request.status = "rejected";
        await request.save();

        res.json({ message: "Connection request rejected" });
    } catch (error) {
        console.log("Error in rejecting the connection");
        res.status(500).json({ message: "Server Error" });
    }
}

export const getConnectionRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await ConnectionRequest.find({
            recipient: userId,
            status: "pending"
        }).populate("sender", "name username profilePicture headline connections");

        res.json(requests);
    } catch (error) {
        console.log("Error in fetching the connection requests");
        res.status(500).json({ message: "Server Error" });
    }
}

export const getUserConnections = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)
            .populate("connections", "name username profilePicture headline connections")
        res.json(user.connections);
    } catch (error) {
        console.log("Error in fetching the connections");
        res.status(500).json({ message: "Server Error" });
    }
}

export const removeConnection = async (req, res) => {
    try {
        const myId = req.user._id;
        const { userId } = req.params;
        await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
        await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });
        res.json({ message: "Connection Removed Successfully" });
    } catch (error) {
        console.log("Error in removing the connection");
        res.status(500).json({ message: "Server Error" });
    }
}

export const getConnectionStatus = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currUserId = req.user._id;

        const currentUser = req.user;
        if (currentUser.connections.includess(targetUserId)) {
            return res.json({ message: "Connected" });
        }

        const pendingRequest = await ConnectionRequest.findOne({
            $or: [
                { sender: currUserId, recipient: targetUserId },
                { sender: targetUserId, recipient: currUserId }
            ], status: "pending"
        })

        if (pendingRequest) {
            if (pendingRequest.sender.toString() === currUserId.toString()) {
                return res.json({ message: "pending" });
            } else {
                return res.json({ status: "received", requestId: pendingRequest._id });
            }
        }
        //if no connection or request found
        res.json({ status: "notConnected" });
    } catch (error) {
        console.log("Error in fetching the connection status");
        res.status(500).json({ message: "Server Error" });
    }
}