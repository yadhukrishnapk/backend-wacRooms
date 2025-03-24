import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String, // Optional for email/password users
    googleId: String, // Store Google ID for OAuth users
    avatar: String // Store Google profile picture
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
