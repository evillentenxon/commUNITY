const EventModel = require('../models/eventsModel');

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { name, body, communityId, author } = req.body;

    const newEvent = new EventModel({
      name,
      body,
      communityId,
      author,
      image: req.file ? req.file.path : null
    });

    await newEvent.save();

    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
};


// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await EventModel.find()
      .populate('author', 'username profilePic')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
};

// Get events by community
const getEventsByCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const events = await EventModel.find({ communityId })
      .populate('author', 'username profile')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error('Error fetching community events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
};

// Like or dislike toggle
const toggleLikeDislike = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, action } = req.body; // action: 'like' or 'dislike'

    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const alreadyLiked = event.likes.includes(userId);
    const alreadyDisliked = event.dislikes.includes(userId);

    if (action === 'like') {
      if (alreadyLiked) {
        event.likes.pull(userId);
      } else {
        if (alreadyDisliked) event.dislikes.pull(userId);
        event.likes.push(userId);
      }
    } else if (action === 'dislike') {
      if (alreadyDisliked) {
        event.dislikes.pull(userId);
      } else {
        if (alreadyLiked) event.likes.pull(userId);
        event.dislikes.push(userId);
      }
    }

    await event.save();
    res.status(200).json({ success: true, message: 'Action updated', event });
  } catch (error) {
    console.error('Error toggling like/dislike:', error);
    res.status(500).json({ success: false, message: 'Failed to update reaction' });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    await EventModel.findByIdAndDelete(eventId);
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventsByCommunity,
  toggleLikeDislike,
  deleteEvent
};
