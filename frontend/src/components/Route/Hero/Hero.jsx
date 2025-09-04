import React from 'react'
import { Link } from "react-router-dom";
import { FaShoppingCart, FaStar, FaTruck, FaShieldAlt } from 'react-icons/fa';

const Hero = () => {
    return (
        <div className="relative min-h-[80vh] bg-gradient-to-br from-white via-orange-50 to-orange-100 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-40 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
                <div className="max-w-7xl mx-auto text-center">
                    {/* Main Heading */}
                    <div className="mb-8">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 leading-tight mb-6">
                            Atlas Ecom
                        </h1>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-orange-700 leading-tight">
                            B2B Business
                        </h2>
                    </div>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-orange-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                        Transform your business with our cutting-edge B2B e-commerce platform. 
                        Connect with trusted suppliers, streamline procurement, and scale your operations.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                        <Link to="/products" className="group">
                            <button className="relative px-12 py-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 ease-out overflow-hidden">
                                <span className="relative z-10 flex items-center gap-3">
                                    <FaShoppingCart className="text-2xl" />
                                    Shop Now
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </Link>
                        
                        <Link to="/events" className="group">
                            <button className="px-12 py-6 bg-white/90 backdrop-blur-md text-orange-700 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl border-2 border-orange-200/50 hover:border-orange-300 transform hover:scale-105 transition-all duration-300 ease-out">
                                <span className="flex items-center gap-3">
                                    <FaStar className="text-2xl text-yellow-500" />
                                    Explore Events
                                </span>
                            </button>
                        </Link>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <FaShoppingCart className="text-2xl text-white" />
                            </div>
                            <div className="text-3xl font-bold text-orange-800 mb-2">50K+</div>
                            <div className="text-orange-600">Products</div>
                        </div>
                        
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <FaTruck className="text-2xl text-white" />
                            </div>
                            <div className="text-3xl font-bold text-orange-800 mb-2">24/7</div>
                            <div className="text-orange-600">Delivery</div>
                        </div>
                        
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <FaStar className="text-2xl text-white" />
                            </div>
                            <div className="text-3xl font-bold text-orange-800 mb-2">4.9</div>
                            <div className="text-orange-600">Rating</div>
                        </div>
                        
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-700 to-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <FaShieldAlt className="text-2xl text-white" />
                            </div>
                            <div className="text-3xl font-bold text-orange-800 mb-2">100%</div>
                            <div className="text-orange-600">Secure</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-orange-400 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-orange-400 rounded-full mt-2 animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export default Hero