import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { errorHandler } from "../utils/error.js";

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return next(errorHandler(404, "User not found"));

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) return next(errorHandler(401, "Invalid credentials"));

        res.status(200).json({ message: "Login successful", user: { id: user._id, email: user.email } });
    } catch (error) {
        next(errorHandler(500, "Server error"));
    }
};

export const googleLogin = async (req, res, next) => {
    const { googleUser } = req.body;

    try {
        let user = await User.findOne({ email: googleUser.email });
        if (!user) {
            user = new User({
                name: googleUser.name,
                email: googleUser.email,
                googleId: googleUser.id,
                avatar: googleUser.picture,
            });
            await user.save();
        }

        res.status(200).json({ message: "Google login successful", user: { id: user._id, email: user.email } });
    } catch (error) {
        next(errorHandler(500, "Server error"));
    }
};