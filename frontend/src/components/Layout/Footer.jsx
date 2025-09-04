import React from "react";
import {
    AiFillFacebook,
    AiFillInstagram,
    AiFillYoutube,
    AiOutlineTwitter,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    footercompanyLinks,
    footerProductLinks,
    footerSupportLinks,
    categoriesData,
} from "../../static/data";
import atlasLogo from "../../Assests/images/atlasEcom.png";


const Footer = () => {
    const { t, i18n } = useTranslation();
    
    return (
        <div className="bg-gradient-to-br from-orange-50 via-white to-orange-100 text-slate-800">
            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="md:flex md:justify-between md:items-center">
                        <div className="md:mb-0 mb-6 md:w-2/5">
                            <h1 className="lg:text-4xl text-3xl font-bold leading-tight">
                                <span className="text-orange-200">Subscribe</span> to get news,{" "}
                                <br />
                                events and exclusive offers
                            </h1>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                required
                                placeholder="Enter your email..."
                                className="px-6 py-4 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 transition-all duration-300 flex-1 min-w-0"
                            />
                            <button className="bg-white text-orange-600 hover:bg-orange-50 duration-300 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info & Social Media */}
                    <div className="text-center sm:text-start">
                        <div className="flex justify-center sm:justify-start mb-6">
                            <img
                                src={atlasLogo}
                                alt="Atlas Ecom Logo"
                                className="h-20 w-auto"
                            />
                        </div>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            {t('footer.socialMedia', 'Visit our social media accounts for the latest updates and exclusive offers:')}
                        </p>
                        <div className={`flex items-center justify-center sm:justify-start space-x-4 ${i18n.language === 'ar' ? 'space-x-reverse' : ''}`}>
                            <a 
                                href="https://www.facebook.com/share/1EeJdxcxQb/?mibextid=wwXIfr" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-all duration-300 transform hover:scale-110"
                            >
                                <AiFillFacebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-all duration-300 transform hover:scale-110">
                                <AiOutlineTwitter size={20} />
                            </a>
                            <a 
                                href="https://www.instagram.com/atlasecom_/profilecard/?igsh=MTcyZXMzbHAzYjhsYw==" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-all duration-300 transform hover:scale-110"
                            >
                                <AiFillInstagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-all duration-300 transform hover:scale-110">
                                <AiFillYoutube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Categories - First Section (5 items) */}
                    <div className="text-center sm:text-start">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b-2 border-orange-200 pb-2">
                            {t('footer.categories', 'Categories')}
                        </h2>
                        <ul className="space-y-3">
                            {categoriesData.slice(0, 5).map((category, index) => (
                                <li key={category.id}>
                                    <Link
                                        className="text-slate-600 hover:text-orange-600 duration-300 text-sm cursor-pointer leading-6 block py-1 hover:translate-x-1 transition-all duration-300"
                                        to={`/products?category=${encodeURIComponent(category.title.en)}`}
                                    >
                                        {category.title[i18n.language] || category.title.en}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories - Second Section (6 items) */}
                    <div className="text-center sm:text-start">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b-2 border-orange-200 pb-2">
                            {t('footer.categories', 'Categories')}
                        </h2>
                        <ul className="space-y-3">
                            {categoriesData.slice(5, 11).map((category, index) => (
                                <li key={category.id}>
                                    <Link
                                        className="text-slate-600 hover:text-orange-600 duration-300 text-sm cursor-pointer leading-6 block py-1 hover:translate-x-1 transition-all duration-300"
                                        to={`/products?category=${encodeURIComponent(category.title.en)}`}
                                    >
                                        {category.title[i18n.language] || category.title.en}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="text-center sm:text-start">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b-2 border-orange-200 pb-2">
                            {t('footer.support', 'Support')}
                        </h2>
                        <ul className="space-y-3">
                            {footerSupportLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        className="text-slate-600 hover:text-orange-600 duration-300 text-sm cursor-pointer leading-6 block py-1 hover:translate-x-1 transition-all duration-300"
                                        to={link.link}
                                    >
                                        {link.name[i18n.language] || link.name.en}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-orange-200 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center text-slate-600 text-sm">
                        <span className="flex items-center justify-center sm:justify-start">
                            <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {t('footer.copyright', '© 2025 AtlasEcom. All rights reserved.')}
                        </span>
                        <span className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            {t('footer.terms', 'Terms · Privacy Policy')}
                        </span>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;