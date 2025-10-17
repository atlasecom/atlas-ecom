import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineVideoCamera, AiOutlineEye } from "react-icons/ai";
import { MdPlayCircleOutline } from "react-icons/md";
import { BiChevronRight } from "react-icons/bi";
import { getAuthToken } from "../../utils/auth";

const TutorialsList = () => {
  const { t, i18n } = useTranslation();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const { data } = await axios.get(`${server}/api/tutorials/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTutorials(data.tutorials || []);
    } catch (error) {
      console.error("Fetch tutorials error:", error);
      toast.error(t("common.fetchError", "Failed to fetch tutorials"));
    } finally {
      setLoading(false);
    }
  };

  const handleTutorialClick = async (tutorial) => {
    setSelectedTutorial(tutorial);
    
    // Track view
    try {
      await axios.get(`${server}/api/tutorials/${tutorial._id}`, {
        withCredentials: true
      });
    } catch (error) {
      console.error("Track view error:", error);
    }
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return "";
    
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be") 
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar - Tutorials List */}
      <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col h-[35vh] lg:max-h-full lg:h-full flex-shrink-0">
        {/* Header */}
        <div className="p-3 lg:p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 flex-shrink-0">
          <h1 className="text-base lg:text-xl font-bold text-gray-800 flex items-center gap-2">
            <AiOutlineVideoCamera className="text-orange-600" size={18} />
            {t("tutorial.platformTutorials", "Platform Tutorials")}
          </h1>
          <p className="text-xs lg:text-sm text-gray-600 mt-1">{t("tutorial.learnHow", "Learn platform")}</p>
        </div>

        {/* Tutorials List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : tutorials.length === 0 ? (
            <div className="text-center py-12 px-4">
              <AiOutlineVideoCamera className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-sm text-gray-600">{t("tutorial.noTutorials", "No tutorials available")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tutorials.map((tutorial) => (
                <button
                  key={tutorial._id}
                  onClick={() => handleTutorialClick(tutorial)}
                  className={`w-full text-left p-3 lg:p-4 hover:bg-orange-50 transition-colors ${
                    selectedTutorial?._id === tutorial._id ? 'bg-orange-50 border-l-4 border-orange-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 lg:gap-3">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                      {tutorial.thumbnail?.url ? (
                        <img
                          src={tutorial.thumbnail.url}
                          alt={tutorial.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MdPlayCircleOutline className="text-orange-600" size={24} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs lg:text-sm text-gray-900 line-clamp-2 mb-1 lg:mb-2">
                        {i18n.language === 'ar' && tutorial.titleAr ? tutorial.titleAr :
                         i18n.language === 'fr' && tutorial.titleFr ? tutorial.titleFr :
                         tutorial.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <AiOutlineEye size={12} />
                          {tutorial.views || 0}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <BiChevronRight className={`flex-shrink-0 text-gray-400 transition-colors ${
                      selectedTutorial?._id === tutorial._id ? 'text-orange-600' : ''
                    }`} size={18} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Video Player */}
      <div className="flex-1 overflow-y-auto bg-gray-50 h-[65vh] lg:h-full">
        {selectedTutorial ? (
          <div className="w-full">
            {/* Video Header */}
            <div className="p-3 lg:p-6 bg-white border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">
                {i18n.language === 'ar' && selectedTutorial.titleAr ? selectedTutorial.titleAr :
                 i18n.language === 'fr' && selectedTutorial.titleFr ? selectedTutorial.titleFr :
                 selectedTutorial.title}
              </h2>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <AiOutlineEye size={14} />
                  {selectedTutorial.views || 0} {t("tutorial.views", "views")}
                </span>
              </div>
            </div>

            {/* Video Player */}
            <div className="bg-black w-full flex-shrink-0">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={getVideoEmbedUrl(selectedTutorial.videoUrl)}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedTutorial.title}
                />
              </div>
            </div>

            {/* Description - Always visible with scroll */}
            <div className="p-3 lg:p-6 bg-white">
              <h3 className="text-sm lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
                <span className="w-1 h-4 lg:h-6 bg-orange-600 rounded"></span>
                {t("tutorial.description", "Description")}
              </h3>
              <div className="text-xs lg:text-base text-gray-700 whitespace-pre-wrap leading-relaxed pb-6 lg:pb-8">
                {i18n.language === 'ar' && selectedTutorial.descriptionAr ? selectedTutorial.descriptionAr :
                 i18n.language === 'fr' && selectedTutorial.descriptionFr ? selectedTutorial.descriptionFr :
                 selectedTutorial.description}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[300px] flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg">
                <AiOutlineVideoCamera className="text-orange-600" size={24} />
              </div>
              <h3 className="text-base lg:text-xl font-bold text-gray-900 mb-1 lg:mb-2">{t("tutorial.selectTutorial", "Select a Tutorial")}</h3>
              <p className="text-xs lg:text-base text-gray-600">{t("tutorial.selectFromList", "Choose a tutorial from the list to start learning")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialsList;

