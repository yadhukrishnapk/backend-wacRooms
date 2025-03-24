import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const test= (req, res) => {
    res.json({ message: 'Hello WacRooms!' });
}
export const getUserById = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const user = await User.findById(id);
      if (!user) return next(errorHandler(404, 'User not found'));
  
      // Return only the fields you want to expose
      const userDetails = {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      };
  
      res.status(200).json(userDetails);
    } catch (error) {
      next(errorHandler(500, 'Server error'));
    }
  };