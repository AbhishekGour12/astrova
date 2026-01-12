import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  astrologer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Astrologer',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['CHAT', 'CALL'],
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'serviceType' // Will reference either Chat or Call model
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure one review per service
reviewSchema.index({ user: 1, serviceId: 1 }, { unique: true });

// Virtual for formatted rating
reviewSchema.virtual('stars').get(function() {
  return '⭐'.repeat(this.rating);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;