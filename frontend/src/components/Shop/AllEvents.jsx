import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteEvent, clearErrors } from "../../redux/actions/event";
import { server } from "../../server";
import Loader from "../Layout/Loader";
import { toast } from "react-toastify";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";
import { FiBarChart, FiEye, FiTrash2, FiPlus, FiCamera, FiStar, FiCalendar, FiEdit, FiEyeOff } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const AllEvents = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state) => state.user);
  const eventState = useSelector((state) => state.events);
  const message = eventState?.message || null;
  const error = eventState?.error || null;
  const deleteLoading = eventState?.isLoading || false;
  const dispatch = useDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [localDeleteLoading, setLocalDeleteLoading] = useState(false);
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [eventToHide, setEventToHide] = useState(null);
  const [localHideLoading, setLocalHideLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Fetch all events for the shop
  const fetchEvents = async (status = 'all') => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      const shopId = user.shop._id || user.shop;
      // Use the seller-specific API endpoint that returns all events (active and inactive)
      const { data } = await axios.get(`${server}/api/shops/${shopId}/events/seller?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(data.events || []);
      
      // Show notification if expired events were deleted
      if (data.deletedExpiredEvents && data.deletedExpiredEvents > 0) {
        toast.info(t("allEvents.expiredEventsDeleted", `🕐 ${data.deletedExpiredEvents} expired event(s) were automatically deleted`, { count: data.deletedExpiredEvents }));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(error.response?.data?.message || t("allEvents.failedToFetch", "Failed to fetch events"));
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.shop) {
      fetchEvents(statusFilter);
    }
  }, [user?.shop, statusFilter]);

  const handleDelete = (id) => {
    const event = events.find(e => e._id === id);
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    setLocalDeleteLoading(true);
    try {
      console.log('Deleting event with ID:', eventToDelete._id);
      await dispatch(deleteEvent(eventToDelete._id));
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(t("allEvents.failedToDelete", "Failed to delete event. Please try again."));
    } finally {
      setLocalDeleteLoading(false);
    }
  };

  // Handle delete success/error from Redux state
  useEffect(() => {
    if (message && !deleteLoading) {
      toast.success(message);
      setDeleteModalOpen(false);
      setEventToDelete(null);
      
      // Refresh the events list
      fetchEvents();
      
      // Clear the message
      dispatch(clearErrors());
    }
  }, [message, deleteLoading, dispatch]);

  // Handle delete error from Redux state
  useEffect(() => {
    if (error && !deleteLoading) {
      toast.error(error);
      // Clear the error
      dispatch(clearErrors());
    }
  }, [error, deleteLoading, dispatch]);

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleHide = (event) => {
    setEventToHide(event);
    setHideModalOpen(true);
  };

  const confirmHide = async () => {
    if (!eventToHide) return;
    
    setLocalHideLoading(true);
    try {
      const token = getAuthToken();
      const newStatus = !eventToHide.isActive;
      
      const response = await axios.put(`${server}/api/events/${eventToHide._id}`, 
        { isActive: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(newStatus ? t("allEvents.eventShown", "Event shown successfully") : t("allEvents.eventHidden", "Event hidden successfully"));
        
        // Update the event in the local state
        setEvents(prev => prev.map(e => 
          e._id === eventToHide._id ? { ...e, isActive: newStatus } : e
        ));
        
        setHideModalOpen(false);
        setEventToHide(null);
      } else {
        toast.error(response.data.message || t("allEvents.failedToUpdateStatus", "Failed to update event status"));
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error(t("allEvents.failedToUpdateStatus", "Failed to update event status. Please try again."));
    } finally {
      setLocalHideLoading(false);
    }
  };

  const cancelHide = () => {
    setHideModalOpen(false);
    setEventToHide(null);
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
    setSelectedImage("");
  };

  const getImageUrl = (event) => {
    if (event?.images && Array.isArray(event.images) && event.images.length > 0) {
      const imageObj = event.images[0];
      
      // Handle different image formats with cache busting
      if (imageObj && typeof imageObj === 'object' && imageObj.url) {
        const imageUrl = imageObj.url;
        // Don't add cache busting to data URIs
        if (imageUrl.startsWith('data:')) {
          return imageUrl;
        }
        if (typeof imageUrl === 'string' && imageUrl.startsWith("http")) {
          return imageUrl + '?v=' + Date.now();
        }
        if (typeof imageUrl === 'string') {
          // For relative paths like /uploads/events/filename.jpg
          return `${server.replace(/\/$/, "")}${imageUrl}?v=${Date.now()}`;
        }
      }
      if (typeof imageObj === 'string') {
        // Don't add cache busting to data URIs
        if (imageObj.startsWith('data:')) {
          return imageObj;
        }
        if (imageObj.startsWith("http")) {
          return imageObj + '?v=' + Date.now();
        }
        // For direct string paths
        return `${server.replace(/\/$/, "")}/${imageObj.replace(/^\//, "")}?v=${Date.now()}`;
      }
    }
    return '/default-event.png';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t("allEvents.title", "All Events")}</h1>
        
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{t("allEvents.filter", "Filter")}:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              <option value="all">{t("allEvents.allEvents", "All Events")}</option>
              <option value="active">{t("allEvents.visibleOnly", "Visible Only")}</option>
              <option value="inactive">{t("allEvents.hiddenOnly", "Hidden Only")}</option>
            </select>
          </div>
          
          <Link
            to="/dashboard-create-event"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
          >
            <FiPlus className="mr-2" size={16} />
{t("allEvents.addNewEvent", "Add New Event")}
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <FiBarChart className="text-6xl mb-4 block text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{t("allEvents.noEventsFound", "No Events Found")}</h3>
          <p className="text-gray-500 mb-4">{t("allEvents.startCreating", "Start by creating your first event")}</p>
          <Link
            to="/dashboard-create-event"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center mx-auto w-fit"
          >
            <FiPlus className="mr-2" size={16} />
            {t("allEvents.createEvent", "Create Event")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Event Image */}
              <div className="relative h-48 bg-gray-200">
                {event.images && event.images.length > 0 ? (
                  <img
                    src={getImageUrl(event)}
                    alt={event.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openImageModal(getImageUrl(event))}
                    onError={(e) => {
                      console.error('Image load error for event:', event.name, 'URL:', e.target.src);
                      // Try alternative loading methods
                      const imageObj = event.images?.[0];
                      if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                        // Try without cache busting
                        e.target.src = imageObj.url;
                      } else {
                        e.target.src = '/default-event.png';
                      }
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully for event:', event.name);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                      <FiCalendar className="text-gray-400 mx-auto mb-2" size={48} />
                      <p className="text-gray-500 text-sm font-medium">{t("allEvents.noImage", "No Image")}</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                    {event.category?.name || event.category || 'Category'}
                  </span>
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className={`px-2 py-1 text-white text-xs rounded-full w-fit ${
                    event.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {event.isActive ? t("allEvents.live", "Live") : t("allEvents.hidden", "Hidden")}
                  </span>
                  <span className={`px-2 py-1 text-white text-xs rounded-full ${
                    event.status === 'Running' ? 'bg-green-500' :
                    event.status === 'Ended' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {event.status === 'Running' ? t("allEvents.running", "Running") :
                     event.status === 'Ended' ? t("allEvents.ended", "Ended") :
                     event.status === 'Pending' ? t("allEvents.pending", "Pending") :
                     event.status === 'Scheduled' ? t("allEvents.scheduled", "Scheduled") :
                     event.status === 'Cancelled' ? t("allEvents.cancelled", "Cancelled") :
                     event.status}
                  </span>
                </div>
                {/* Show expiration warning if event ends within 24 hours */}
                {(() => {
                  const endDate = new Date(event.Finish_Date);
                  const now = new Date();
                  const timeDiff = endDate.getTime() - now.getTime();
                  const hoursLeft = timeDiff / (1000 * 60 * 60);
                  
                  if (hoursLeft > 0 && hoursLeft <= 24) {
                    return (
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full animate-pulse">
                          ⏰ {t("allEvents.expiresIn", "Expires in")} {Math.ceil(hoursLeft)}h
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Event Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{event.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-orange-600">
                      {event.originalPrice} - {event.discountPrice} DH
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiStar className="text-yellow-400" size={16} />
                    <span className="text-sm text-gray-600">{event.ratings || 0}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">{t("allEvents.stock", "Stock")}:</span>
                    <span className={`ml-1 font-medium ${event.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {event.stock}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("allEvents.sold", "Sold")}:</span>
                    <span className="ml-1 font-medium text-gray-900">{event.sold_out || 0}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>{t("allEvents.startDate", "Start")}: {formatDate(event.start_Date)}</span>
                    <span>{t("allEvents.endDate", "End")}: {formatDate(event.Finish_Date)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/product/${event._id}?isEvent=true`}
                    className="bg-blue-500 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    <FiEye className="mr-1" size={14} />
                    {t("allEvents.preview", "Preview")}
                  </Link>
                  <Link
                    to={`/dashboard-edit-event/${event._id}`}
                    className="bg-orange-500 text-white text-sm py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                  >
                    <FiEdit className="mr-1" size={14} />
                    {t("allEvents.edit", "Edit")}
                  </Link>
                  <button
                    onClick={() => handleHide(event)}
                    className={`text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center ${
                      event.isActive 
                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {event.isActive ? (
                      <>
                        <FiEyeOff className="mr-1" size={14} />
                        {t("allEvents.hide", "Hide")}
                      </>
                    ) : (
                      <>
                        <FiEye className="mr-1" size={14} />
                        {t("allEvents.show", "Show")}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="bg-red-500 text-white text-sm py-2 px-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <FiTrash2 className="mr-1" size={14} />
                    {t("allEvents.delete", "Delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full mx-4">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <span className="text-3xl">✕</span>
            </button>
            <img
              src={selectedImage}
              alt="Event"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t("allEvents.deleteEvent", "Delete Event")}</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              {t("allEvents.areYouSureDelete", "Are you sure you want to delete")} "{eventToDelete?.name}"? {t("allEvents.thisActionCannotBeUndone", "This action cannot be undone.")}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("allEvents.cancel", "Cancel")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={localDeleteLoading || deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {(localDeleteLoading || deleteLoading) ? t("allEvents.deleting", "Deleting...") : t("allEvents.delete", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide/Show Confirmation Modal */}
      {hideModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {eventToHide?.isActive ? t("allEvents.hideEvent", "Hide Event") : t("allEvents.showEvent", "Show Event")}
              </h3>
              <button
                onClick={cancelHide}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              {t("allEvents.areYouSureHide", "Are you sure you want to")} {eventToHide?.isActive ? t("allEvents.hide", "hide") : t("allEvents.show", "show")} "{eventToHide?.name}"? 
              {eventToHide?.isActive 
                ? ` ${t("allEvents.hiddenEventsNotice", "Hidden events will not be visible to customers.")}` 
                : ` ${t("allEvents.eventWillBeVisible", "The event will be visible to customers again.")}`
              }
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelHide}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("allEvents.cancel", "Cancel")}
              </button>
              <button
                onClick={confirmHide}
                disabled={localHideLoading}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  eventToHide?.isActive 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {localHideLoading ? t("allEvents.updating", "Updating...") : (eventToHide?.isActive ? t("allEvents.hide", "Hide") : t("allEvents.show", "Show"))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;
