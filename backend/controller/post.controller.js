import Post from "../models/post.model.js";
import Notification from "../models/notrification.model.js";
import cloudinary from "../lib/cloudinary.js";
//to get the fetch the posts of the user that we are connected with
export const getFeedPosts = async (req, res) => {
    try {
        const post = await Post.find({ author: { $in: req.user.connections } })
            .populate("author", "name username profilePicture headline")
            .populate("comments.user", "name profilePicture")
            .sort({ createdAt: -1 });

        // author ke andar jo users hein unka name,username, etc.
        //comments. user ke andar jo name, profilePicture hein etc.

        res.status(200).json({ post });
    } catch (error) {
        console.log("error in getFeedPosts", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


// .select() controls what fields are returned from the main document.

// .populate(path, fields) controls what fields are returned from the referenced documents.

// You can't use .select() to control what’s inside .populate() — they work on different levels.

export const createPost = async (req, res) => {
    try {
        const { content, image } = req.body;
        let newPost;
        if (image) {
            const imgResult = await cloudinary.uploader.upload(image);
            newPost = new Post({
                author: req.user._id,
                content,
                image: imgResult.secure_url
            })
        } else {
            newPost = new Post({
                author: req.user._id,
                content
            })
        }
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.log("Error in creating post", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        //check if the author is current user is the author of the post
        if (post.author.toString() != userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete the  post" })
        }

        //delete the image from cloudinary url
        if (post.image) {
            await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]);
        }
        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "post deleted successfully" });
    } catch (error) {

    }
}


export const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId)
            .populate("author", "name username profilePicture headline")
            .populate("comments.user", "name profilePicture username headline")
        //by default image aa rha hei..
        res.status(post);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


export const createComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: { comments: { user: req.user._id, content } },

            }, { new: true }
        ).populate("author", "name email username headline profilePicture")

        //create a notification if the comment owner is not the post owner
        if (post.author.toString() != req.user._id.toString()) {
            const newNotification = new Notification({
                recipient: post.author,
                type: "comment",
                relatedUser: req.user._id,
                relatedPost: postId
            })

            await newNotification.save();
            res.status(200).json(post);
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const likePost = async(req, res)=>{
    try{
        const postId = req.params.id;
        const post = await Post.findById(postId);
        const userId = req.user._id;

        if(post.likes.includes(userId)){ //unliking
            //filter creates a new array
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else { //liking
            post.likes.push(userId)
            //create a notification if the post owner is not the user who liked;
            const newNotification = new Notification({
                recipient: post.author,
                type: "like",
                relatedUser: req.user._id,
                relatedPost: postId,
            });
            await newNotification.save();
        }
        await post.save();
        res.status(200).json(post);
    }catch(error){
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}