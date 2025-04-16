const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commentText: {
        type: String,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model('Comment', commentSchema);
