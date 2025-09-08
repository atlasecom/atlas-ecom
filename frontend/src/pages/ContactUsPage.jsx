import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { toast } from "react-toastify";
import { AiFillPhone, AiFillMail, AiFillFacebook, AiFillInstagram } from "react-icons/ai";
import { server } from "../server";

const ContactUsPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error(t("contact.fillAllFields", "Please fill in all fields"));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t("contact.invalidEmail", "Please enter a valid email address"));
      return;
    }

    try {
      // Send email using the backend API
      const response = await fetch(`${server}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (response.ok) {
        toast.success(t("contact.messageSent", "Thank you! Your message has been sent successfully. We'll get back to you soon."));
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t("contact.messageError", "Sorry, there was an error sending your message. Please try again or contact us directly."));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <Header activeHeading={6} />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            {t("contact.title", "Contact Us")}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {t("contact.subtitle", "We'd love to hear from you. Send us a message and we'll respond as soon as possible.")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {t("contact.getInTouch", "Get in Touch")}
              </h2>
              <p className="text-slate-600 mb-8">
                {t("contact.description", "Have a question about our products or services? Need help with an order? We're here to help! Reach out to us using any of the methods below.")}
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AiFillPhone className="text-orange-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {t("contact.phone", "Phone")}
                  </h3>
                  <p className="text-slate-600">0708000863</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AiFillMail className="text-orange-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {t("contact.email", "Email")}
                  </h3>
                  <p className="text-slate-600">atlasecom0@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {t("contact.followUs", "Follow Us")}
              </h3>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/share/1EeJdxcxQb/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-all duration-300 transform hover:scale-110"
                >
                  <AiFillFacebook size={20} />
                </a>
                <a 
                  href="https://www.instagram.com/atlasecom_/profilecard/?igsh=MTcyZXMzbHAzYjhsYw==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-all duration-300 transform hover:scale-110"
                >
                  <AiFillInstagram size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {t("contact.sendMessage", "Send us a Message")}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  {t("contact.name", "Full Name")} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  placeholder={t("contact.namePlaceholder", "Enter your full name")}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  {t("contact.email", "Email Address")} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  placeholder={t("contact.emailPlaceholder", "Enter your email address")}
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                  {t("contact.subject", "Subject")} *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  placeholder={t("contact.subjectPlaceholder", "What is this about?")}
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  {t("contact.message", "Message")} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 resize-none"
                  placeholder={t("contact.messagePlaceholder", "Tell us how we can help you...")}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {t("contact.sendButton", "Send Message")}
              </button>
            </form>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default ContactUsPage;
