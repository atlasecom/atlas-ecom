import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
import { createevent, clearErrors } from "../../redux/actions/event";

const CreateEvent = () => {
  const { user } = useSelector((state) => state.user);
  const eventState = useSelector((state) => state.events);
  const message = eventState?.message || null;
  const error = eventState?.error || null;
  const createLoading = eventState?.isLoading || false;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isRTL = i18n.language === "ar";

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState();
  const [discountPrice, setDiscountPrice] = useState();
  const [stock, setStock] = useState();
  const [minOrderQuantity, setMinOrderQuantity] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStartDateChange = (e) => {
    const startDate = new Date(e.target.value);
    const minEndDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    setStartDate(startDate);
    setEndDate(null);
    document.getElementById("end-date").min = minEndDate
      .toISOString()
      .slice(0, 10);
  };

  const handleEndDateChange = (e) => {
    const endDate = new Date(e.target.value);
    setEndDate(endDate);
  };

  const today = new Date().toISOString().slice(0, 10);

  const minEndDate = startDate
    ? new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : "";

  const handleImageChange = (e) => {
    e.preventDefault();

    let files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const resetForm = () => {
    console.log('Resetting form fields');
    setImages([]);
    setName("");
    setDescription("");
    setCategory("Electronics");
    setTags("");
    setOriginalPrice("");
    setDiscountPrice("");
    setStock("");
    setMinOrderQuantity(1);
    setStartDate(null);
    setEndDate(null);
    console.log('Form reset completed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (
        !name ||
        !description ||
        !category ||
        !tags ||
        !originalPrice ||
        !discountPrice ||
        !stock ||
        !minOrderQuantity ||
        !startDate ||
        !endDate ||
        images.length === 0
      ) {
        toast.error(
          t("createEvent.fillAllFields", "Please fill in all required fields")
        );
        setLoading(false);
        return;
      }

      const newForm = new FormData();

      images.forEach((image) => {
        newForm.append("images", image);
      });
      newForm.append("name", name);
      newForm.append("description", description);
      newForm.append("category", category);
      newForm.append("tags", tags);

      // If originalPrice is empty, set it to discountPrice
      const finalOriginalPrice =
        originalPrice && originalPrice.trim() !== ""
          ? originalPrice
          : discountPrice;
      newForm.append("originalPrice", finalOriginalPrice);

      newForm.append("discountPrice", discountPrice);
      newForm.append("stock", stock);
      newForm.append("minOrderQuantity", minOrderQuantity);
      const shopId = user.shop._id || user.shop;
      // Note: shopId is not needed as it's taken from user.shop in backend
      newForm.append("start_Date", startDate.toISOString());
      newForm.append("Finish_Date", endDate.toISOString());

      console.log('Creating event with form data');
      await dispatch(createevent(newForm));
      
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle create success/error from Redux state
  useEffect(() => {
    console.log('Success effect triggered:', { message, createLoading });
    if (message && !createLoading) {
      console.log('Resetting form and showing success message');
      toast.success(message);
      // Reset form first
      resetForm();
      // Clear the message
      dispatch(clearErrors());
      // Redirect to dashboard after a short delay so user can see form reset
      setTimeout(() => {
        navigate("/dashboard-events");
      }, 1500);
    }
  }, [message, createLoading, navigate, dispatch]);

  // Handle create error from Redux state
  useEffect(() => {
    if (error && !createLoading) {
      toast.error(error);
      // Clear the error
      dispatch(clearErrors());
    }
  }, [error, createLoading, dispatch]);

  return (
    <div className="w-full">
      <div className="w-full px-0 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <h5 className="text-[30px] font-Poppins text-center">
            {t("createEvent.title")}
          </h5>
          {/* create event form */}
          <form onSubmit={handleSubmit}>
            <br />
            <div>
              <label className="pb-2">
                {t("createEvent.name")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={name}
                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("createEvent.namePlaceholder")}
              />
            </div>
            <br />
            <div>
              <label className="pb-2">
                {t("createEvent.description")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                cols="30"
                required
                rows="8"
                type="text"
                name="description"
                value={description}
                className={`mt-2 appearance-none block w-full pt-2 px-3 border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("createEvent.descriptionPlaceholder")}
              ></textarea>
            </div>
            <br />
            <div>
              <label className="pb-2">
                {t("createEvent.category")} <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full mt-2 border h-[35px] rounded-[5px] px-3 ${
                  isRTL ? "text-right" : "text-left"
                }`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">{t("createEvent.chooseCategory", "Choose a category")}</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports & Outdoors">Sports & Outdoors</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Books & Media">Books & Media</option>
                <option value="Automotive">Automotive</option>
                <option value="Toys & Games">Toys & Games</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Jewelry & Accessories">Jewelry & Accessories</option>
                <option value="Pet Supplies">Pet Supplies</option>
              </select>
            </div>
            <br />
            <div>
              <label className="pb-2">{t("createEvent.tags")}</label>
              <input
                type="text"
                name="tags"
                value={tags}
                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t("createEvent.tagsPlaceholder")}
              />
            </div>
            <br />
            <div>
              <label className="pb-2">{t("createEvent.originalPrice")}</label>
              <input
                type="number"
                name="price"
                value={originalPrice}
                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder={t("createEvent.originalPricePlaceholder")}
              />
            </div>
            <br />
            <div>
              <label className="pb-2">
                {t("createEvent.discountPrice")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={discountPrice}
                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder={t("createEvent.discountPricePlaceholder")}
              />
            </div>
            <br />
            <div>
              <label className="pb-2">
                {t("createEvent.stock")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={stock}
                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
                onChange={(e) => setStock(e.target.value)}
                placeholder={t("createEvent.stockPlaceholder")}
              />
            </div>
                    <br />
            <div>
              <label className="pb-2">
                {t("createEvent.minOrderQuantity", "Quantité minimale pour produit")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="minOrderQuantity"
                value={minOrderQuantity}
                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
                onChange={(e) => setMinOrderQuantity(e.target.value)}
                placeholder={t("createEvent.minOrderQuantityPlaceholder", "Entrez la quantité minimale...")}
                min="1"
                step="1"
              />
            </div>
            <br />
            <div>
              <label className="pb-2">
                {t("createEvent.startDate")} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="price"
                id="start-date"
                value={startDate ? startDate.toISOString().slice(0, 10) : ""}
                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
                onChange={handleStartDateChange}
                min={today}
              />
            </div>
            <br />
            <div>
              <label className="pb-2">
                {t("createEvent.endDate")} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="price"
                id="end-date"
                value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
                onChange={handleEndDateChange}
                min={minEndDate}
              />
            </div>
            <br />
            <div>
              <label className="pb-2">
                {t("createEvent.uploadImages")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name=""
                id="upload"
                className="hidden"
                multiple
                onChange={handleImageChange}
              />
              <div
                className={`w-full flex items-center flex-wrap ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <label htmlFor="upload">
                  <AiOutlinePlusCircle
                    size={30}
                    className="mt-3 cursor-pointer"
                    color="#555"
                  />
                </label>
                {images &&
                  images.map((i) => (
                    <img
                      src={URL.createObjectURL(i)}
                      key={i}
                      alt=""
                      className="h-[120px] w-[120px] object-cover m-2"
                    />
                  ))}
              </div>
              <br />
              <div>
                <input
                  type="submit"
                  value={
                    (loading || createLoading)
                      ? t("createEvent.creating", "Creating...")
                      : t("createEvent.createButton")
                  }
                  disabled={loading || createLoading}
                  className={`mt-2 cursor-pointer appearance-none text-center block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white transition-colors ${
                    (loading || createLoading)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
