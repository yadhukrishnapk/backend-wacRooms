// backend/controllers/event.controller.js
import Event from "../models/event.model.js";
import { errorHandler } from "../utils/error.js";

export const createEvent = async (req, res, next) => {
    
  try {
    const { title, start, end, category, room, userId } = req.body;
    if (!userId) {
        return next(errorHandler(400, "User ID is required"));
    }

    const newEvent = new Event({
      title,
      start,
      end,
      category,
      userId,
      room,
      isEnded: false
    });

    await newEvent.save();
    res.status(201).json({ 
      success: true,
      message: "Event created successfully",
      event: newEvent 
    });
  } catch (error) {
    next(errorHandler(500, "Error creating event"));
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const room = req.params.room;
    const currentTime = new Date();
    
    await Event.updateMany(
      { 
        room, 
        end: { $lte: currentTime }, 
        isEnded: false 
      },
      { 
        $set: { isEnded: true } 
      }
    );
    
    const events = await Event.find({ 
      room, 
      isEnded: false 
    }).populate("userId", "name email avatar"); 

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    next(errorHandler(500, "Error fetching events"));
  }
};

export const deleteEvent = async (req, res, next) => {
  console.log("delete event");
  
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return next(errorHandler(404, "Event not found"));
    }

    await event.deleteOne();
    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Error deleting event"));
  }
};

export const updateEvent = async (req, res, next) => {
  console.log("update event");
  
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    const event = await Event.findByIdAndUpdate(eventId, updateData, { new: true });

    if (!event) {
      return next(errorHandler(404, "Event not found"));
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    next(errorHandler(500, "Error updating event"));
  }
};


export const getAllEvents = async (req, res, next) => {
  try {
    const { room, limit = 8, skip = 0 } = req.query; 
    const query = room ? { room } : {}; 

    const events = await Event.aggregate([
      { $match: query }, 
      { $sort: { createdAt: -1 } },
      { 
        $project: {
          _id: 1,
          title: 1,
          start: 1,
          end: 1,
          category: 1,
          room: 1,
          isEnded: 1,
          createdAt: 1,
          updatedAt: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.avatar": 1,
        }
      },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) }, 
    ]);

    const totalEvents = await Event.countDocuments(query); 

    res.status(200).json({
      success: true,
      events,
      total: totalEvents, 
    });
  } catch (error) {
    next(errorHandler(500, "Error fetching events"));
  }
};