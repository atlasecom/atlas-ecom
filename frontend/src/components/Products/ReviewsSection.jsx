import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AiOutlineMessage } from "react-icons/ai";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
import Avatar from "../Common/Avatar";
import styles from "../../styles/styles";

const ReviewsSection = ({ data, isEvent }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  
  // Debug logging
  console.log("ReviewsSection - Current language:", i18n.language);
  console.log("ReviewsSection - Translation result:", t("reviews.customerReviews", "Customer Reviews"));
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [reviewUsersData, setReviewUsersData] = useState({});

  // Calculate average rating and total reviews
  const totalReviewsLength = data?.reviews?.length || 0;
  const averageRating = data?.reviews?.length > 0 
    ? data.reviews.reduce((acc, review) => acc + review.rating, 0) / data.reviews.length 
    : 0;

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch user data for reviews
  useEffect(() => {
    const fetchReviewUsers = async () => {
      if (!data?.reviews || data.reviews.length === 0) return;

      setLoadingUsers(true);
      try {
        const userIds = data.reviews
          .map((review) => review.user?._id || review.user)
          .filter((id) => id);

        const userPromises = userIds.map(async (userId) => {
          try {
            const token = getAuthToken();
            const response = await axios.get(`${server}/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            return { userId, userData: response.data.user };
          } catch (error) {
            console.error(`Failed to fetch user ${userId}:`, error);
            return { userId, userData: null };
          }
        });

        const userResults = await Promise.all(userPromises);
        const usersData = {};
        userResults.forEach(({ userId, userData }) => {
          if (userData) {
            usersData[userId] = userData;
          }
        });

        setReviewUsersData(usersData);
      } catch (error) {
        console.error("Error fetching review users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchReviewUsers();
  }, [data?.reviews]);

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      toast.error(t("common.loginToCreateConversation", "Please login to create a conversation"));
      return;
    }

    if (comment.trim().length < 10) {
      toast.error(t("common.commentTooShort", "Comment must be at least 10 characters long!"));
      return;
    }

    if (comment.trim().length > 500) {
      toast.error(t("common.commentTooLong", "Comment must be less than 500 characters!"));
      return;
    }

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${server}/products/${data._id}/reviews`,
        {
          rating: parseInt(rating),
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message) {
        toast.success(response.data.message || t("common.reviewSubmitted", "Review submitted successfully!"));
        setShowReviewForm(false);
        setRating(1);
        setComment("");
        // Optionally refresh the page or update the data
        window.location.reload();
      }
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error(
        error.response?.data?.message ||
          t("common.reviewSubmissionError", "Failed to submit review!")
      );
    }
  };

  return (
    <div className={`p-4 ${styles.section}`}>
      {/* Reviews Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`${styles.heading} text-[25px] font-[500] border-b`}>
          {t("reviews.customerReviews", "Customer Reviews")} ({totalReviewsLength})
        </h2>
        
        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <AiOutlineMessage className="w-4 h-4" />
            {showReviewForm ? t("common.cancel", "Cancel") : t("common.writeReview", "Write Review")}
          </button>
        )}
      </div>

      {/* Review Form */}
      {isAuthenticated && showReviewForm && (
        <div className="bg-white rounded-2xl shadow-lg mb-8 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("reviews.rating", "Rating")}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("reviews.comment", "Comment")}
              </label>
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("reviews.commentPlaceholder", "Share your experience with this product...")}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  {comment.length}/500
                </div>
              </div>
            </div>

            <button
              onClick={handleReviewSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("reviews.submitReview", "Submit Review")}
            </button>
          </div>
        </div>
      )}

      {/* Reviews Display */}
      {data?.reviews && data.reviews.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {loadingUsers && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span>{t("common.loadingUserData", "Loading user information...")}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {data.reviews.map((review, index) => {
              const userId = review.user?._id || review.user;
              const baseUserData = review.user?._id ? review.user : null;
              const fullUserData = reviewUsersData[userId] || baseUserData;
              const userName = fullUserData?.name || t("common.anonymous", "Anonymous");
              const userAvatar = fullUserData?.avatar;

              return (
                <div key={index} className="flex items-start gap-4 overflow-hidden">
                  <div className="flex-shrink-0">
                    <Avatar 
                      user={{ name: userName, avatar: userAvatar }} 
                      size="lg" 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col 400px:flex-row 400px:items-center 400px:justify-between mb-2 gap-2">
                      <div className="flex flex-col min-w-0">
                        <h4 className="font-semibold text-gray-900 break-words">
                          {userName}
                        </h4>
                        {fullUserData?.email && (
                          <p className="text-sm text-gray-500 break-all">
                            {fullUserData.email}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 400px:hidden">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 400px:flex-col 400px:items-end">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed break-words">
                      {review.comment}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("product.noReviews", "No reviews for this product!")}
          </h3>
          <p className="text-gray-500">
            {t("product.beFirstToReview", "Be the first to review this product!")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
