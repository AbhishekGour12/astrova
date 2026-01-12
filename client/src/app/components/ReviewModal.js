"use client";

import { useState, useEffect } from 'react';
import { FaStar, FaTimes, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function ReviewModal({ 
  serviceId, 
  serviceType, 
  astrologerName,
  onClose,
  onReviewSubmitted 
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Check if user can review
  useEffect(() => {
    const checkReviewEligibility = async () => {
      try {
        const response = await api.get(`/reviews/check/${serviceType}/${serviceId}`);
        if (!response.data.canReview) {
          toast.error(response.data.reason);
          onClose();
        }
      } catch (error) {
        console.error("Check review eligibility error:", error);
      }
    };

    checkReviewEligibility();
  }, [serviceId, serviceType, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/reviews/submit', {
        serviceId,
        serviceType,
        rating,
        comment: comment.trim()
      });

      if (response.data.success) {
        toast.success('Thank you for your review!');
        onReviewSubmitted?.(response.data.review);
        onClose();
      }
    } catch (error) {
      console.error("Submit review error:", error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMessage);
      
      // If already reviewed, close modal
      if (errorMessage.includes('already reviewed')) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Rate Your Experience</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{astrologerName}</h3>
              <p className="text-white/80 text-sm">
                {serviceType === 'CHAT' ? 'Chat Session' : 'Voice Call'}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4 text-center">
                How would you rate your experience?
              </label>
              
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <FaStar
                      className={
                        (hoverRating || rating) >= star
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
              
              <div className="text-center text-gray-600">
                {rating === 0 && 'Select a rating'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Optional: Share your experience (max 500 characters)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C06014] focus:border-transparent resize-none"
                placeholder="What did you like about the session? Any suggestions for improvement?"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {comment.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!rating || isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#D47C3A] hover:to-[#C06014] transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Submit Review
                </>
              )}
            </button>

            {/* Skip Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Skip for now
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              Your review helps astrologers improve their service and helps other users make better choices.
              All reviews are anonymous.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}