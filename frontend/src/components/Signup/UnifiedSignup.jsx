import React, { useState, useRef, useEffect } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RxAvatar } from "react-icons/rx";
import axios from "axios";
import { backend_url, server } from "../../server";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loadUser } from "../../redux/actions/user";
import { setAuthToken } from "../../utils/auth";
import Avatar from "../Common/Avatar";
import { FiUploadCloud } from "react-icons/fi";
import atlasLogo from "../../Assests/images/atlasEcom - Copie.png";

const UnifiedSignup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("customer"); // "customer" or "seller"
  
  // Email verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  
  // WhatsApp phone verification states
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  
  // Seller-specific fields
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [telegram, setTelegram] = useState("");
  const [banner, setBanner] = useState(null);

  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const customerFormRef = useRef(null);
  const sellerFormRef = useRef(null);

  const isRTL = i18n.language === "ar";

  // Reset email verification state when email changes
  useEffect(() => {
    if (email) {
      setEmailVerified(false);
      setCodeSent(false);
      setVerificationCode("");
    }
  }, [email]);

  // Reset phone verification state when phone changes
  useEffect(() => {
    if (shopPhone) {
      setPhoneVerified(false);
      setPhoneCodeSent(false);
      setPhoneVerificationCode("");
    }
  }, [shopPhone]);

  const handleGoogleLogin = () => {
    window.location.href = `${backend_url}/auth/google`;
  };

  // Send verification code
  const handleSendVerificationCode = async () => {
    if (!email) {
      toast.error(t("signup.enterEmailFirst", "Please enter your email address first"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("signup.enterValidEmail", "Please enter a valid email address"));
      return;
    }

    setSendingCode(true);
    try {
      const response = await axios.post(`${server}/api/auth/users/send-verification-code`, {
        email: email,
        type: userType
      });

      if (response.data.success) {
        if (response.data.fallback && response.data.code) {
          // Email sending failed but code is available
          toast.warning(`Email sending failed, but verification code is: ${response.data.code}`);
          setCodeSent(true);
        } else {
          // Email sent successfully
          toast.success(t("signup.verificationCodeSent", "Verification code sent to your email! Check your inbox and spam folder."));
          setCodeSent(true);
        }
      }
    } catch (error) {
      console.error('Send verification code error:', error);
      toast.error(error.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setSendingCode(false);
    }
  };

  // Verify email code
  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      toast.error(t("signup.enterVerificationCode", "Please enter the verification code"));
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error(t("signup.verificationCodeMustBe6Digits", "Verification code must be 6 digits"));
      return;
    }

    try {
      const response = await axios.post(`${server}/api/auth/users/verify-email`, {
        email: email,
        code: verificationCode,
        type: userType
      });

      if (response.data.success) {
        toast.success(t("signup.emailVerifiedSuccessfully", "Email verified successfully!"));
        setEmailVerified(true);
      }
    } catch (error) {
      console.error('Verify email error:', error);
      toast.error(error.response?.data?.message || t("signup.invalidVerificationCodeTryAgain", "Invalid verification code. Please try again."));
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(t("signup.invalidFileType", "Please select an image file"));
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("signup.fileTooLarge", "File size must be less than 10MB"));
        e.target.value = "";
        return;
      }
      setAvatar(file);
    }
  };

  const handleBannerInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(t("signup.pleaseSelectImageFileForBanner", "Please select an image file for the banner"));
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("signup.bannerFileSizeTooLarge", "Banner file size must be less than 10MB"));
        e.target.value = "";
        return;
      }
      setBanner(file);
    }
  };

  // Moroccan phone number validation
  const validateMoroccanPhone = (phone) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Moroccan phone patterns:
    // - Mobile: 06xxxxxxxx, 07xxxxxxxx (with country code: +2126xxxxxxxx, +2127xxxxxxxx)
    // - Landline: 05xxxxxxxx (with country code: +2125xxxxxxxx)
    
    if (cleanPhone.startsWith('212')) {
      // With country code
      const withoutCountryCode = cleanPhone.substring(3);
      return /^(6|7)[0-9]{8}$/.test(withoutCountryCode);
    } else if (cleanPhone.startsWith('0')) {
      // With leading zero
      const withoutZero = cleanPhone.substring(1);
      return /^(6|7)[0-9]{8}$/.test(withoutZero);
    } else {
      // Without country code or leading zero
      return /^(6|7)[0-9]{8}$/.test(cleanPhone);
    }
  };

  // Format Moroccan phone number for display
  const formatMoroccanPhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('212')) {
      const withoutCountryCode = cleanPhone.substring(3);
      return `+212 ${withoutCountryCode.substring(0, 2)} ${withoutCountryCode.substring(2, 5)} ${withoutCountryCode.substring(5)}`;
    } else if (cleanPhone.startsWith('0')) {
      const withoutZero = cleanPhone.substring(1);
      return `+212 ${withoutZero.substring(0, 2)} ${withoutZero.substring(2, 5)} ${withoutZero.substring(5)}`;
    } else if (cleanPhone.length === 9) {
      return `+212 ${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}`;
    }
    
    return phone;
  };

  // Send WhatsApp verification code
  const handleSendPhoneCode = async () => {
    if (!shopPhone) {
      toast.error(t("signup.enterShopPhoneNumber", "Please enter your shop phone number"));
      return;
    }

    if (!validateMoroccanPhone(shopPhone)) {
      toast.error(t("signup.validMoroccanPhone", "Please enter a valid Moroccan phone number (06xxxxxxxx or 07xxxxxxxx)"));
      return;
    }

    setSendingPhoneCode(true);
    
    try {
      const response = await axios.post(`${server}/api/auth/users/send-phone-verification`, {
        phone: shopPhone,
        type: userType
      });

      if (response.data.success) {
        if (response.data.code) {
          // WhatsApp service unavailable, show fallback code
          toast.warning(`WhatsApp service unavailable. Verification code: ${response.data.code}`);
        } else {
          toast.success(t("signup.verificationCodeSentWhatsapp", "Verification code sent to WhatsApp!"));
        }
        setPhoneCodeSent(true);
      }
    } catch (error) {
      console.error('Send phone code error:', error);
      toast.error(error.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setSendingPhoneCode(false);
    }
  };

  // Verify WhatsApp code
  const handleVerifyPhone = async () => {
    if (!phoneVerificationCode) {
      toast.error(t("signup.enterVerificationCode", "Please enter the verification code"));
      return;
    }

    if (phoneVerificationCode.length !== 6) {
      toast.error(t("signup.verificationCodeMustBe6Digits", "Verification code must be 6 digits"));
      return;
    }

    try {
      const response = await axios.post(`${server}/api/auth/users/verify-phone`, {
        phone: shopPhone,
        code: phoneVerificationCode,
        type: userType
      });

      if (response.data.success) {
        toast.success(t("signup.phoneNumberVerifiedSuccessfully", "Phone number verified successfully!"));
        setPhoneVerified(true);
      }
    } catch (error) {
      console.error('Verify phone error:', error);
      toast.error(error.response?.data?.message || "Invalid verification code. Please try again.");
    }
  };

  const selectAccountType = (formType) => {
    setUserType(formType);
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !password) {
      toast.error(t("signup.fillAllFields", "Please fill in all required fields"));
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error(t("signup.passwordTooShort", "Password must be at least 8 characters long"));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("signup.passwordsDoNotMatchError", "Passwords do not match. Please enter the same password twice."));
      setLoading(false);
      return;
    }

    if (!emailVerified) {
      toast.error(t("signup.pleaseVerifyEmail", "Please verify your email address before creating an account"));
      setLoading(false);
      return;
    }

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const newForm = new FormData();
      
      if (avatar) newForm.append("image", avatar);
      newForm.append("name", name);
      newForm.append("email", email);
      newForm.append("password", password);
      newForm.append("phoneNumber", phoneNumber || '');
      newForm.append("address", address || '');
      newForm.append("role", "user");

      const res = await axios.post(`${server}/api/auth/register`, newForm, config);
      
      if (res.data.success && res.data.token) {
        // Set auth token to automatically log in
        setAuthToken(res.data.token);
        
        // Set user in Redux store
        dispatch({
          type: "LoadUserSuccess",
          payload: res.data.user,
        });
        
        toast.success(t("signup.accountCreated", "Account created successfully! Welcome!"));
        setAvatar(null);
        
        // Redirect to home page for customers
        navigate("/");
      } else {
        toast.success(t("signup.accountCreated", "Account created successfully!"));
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("signup.signupError", "Signup failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate user fields
    if (!name || !email || !password || !confirmPassword) {
      toast.error(t("signup.fillAllUserFields", "Please fill in all required user fields"));
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error(t("signup.passwordMustBe8Chars", "Password must be at least 8 characters long"));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("signup.passwordsDoNotMatchError", "Passwords do not match. Please enter the same password twice."));
      setLoading(false);
      return;
    }

    if (!emailVerified) {
      toast.error(t("signup.pleaseVerifyEmail", "Please verify your email address before creating a seller account"));
      setLoading(false);
      return;
    }

    if (!phoneVerified) {
      toast.error(t("signup.pleaseVerifyPhone", "Please verify your shop phone number before creating a seller account"));
      setLoading(false);
      return;
    }

    // Validate shop fields
    if (!shopName || !shopAddress || !shopPhone || !zipCode) {
      toast.error(t("signup.fillAllShopFields", "Please fill in all required shop fields"));
      setLoading(false);
      return;
    }

    try {
      // First create the user account
      const userConfig = { headers: { "Content-Type": "multipart/form-data" } };
      const userForm = new FormData();
      
      if (avatar) userForm.append("image", avatar);
      userForm.append("name", name);
      userForm.append("email", email);
      userForm.append("password", password);
      userForm.append("phoneNumber", phoneNumber || '');
      userForm.append("address", address || '');
      userForm.append("shopPhone", shopPhone);
      userForm.append("role", "user"); // Start as user, become-seller will upgrade to seller

      const userRes = await axios.post(`${server}/api/auth/register`, userForm, userConfig);
      
      if (userRes.data.success) {
        // Set auth token
        setAuthToken(userRes.data.token);
        
        // Create shop
        const shopConfig = {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${userRes.data.token}`,
          },
        };
        const shopForm = new FormData();
        
        shopForm.append("name", shopName);
        shopForm.append("description", shopDescription);
        shopForm.append("address", shopAddress);
        shopForm.append("phoneNumber", shopPhone);
        shopForm.append("zipCode", zipCode);
        shopForm.append("telegram", telegram);
        
        if (banner) shopForm.append("image", banner);

        const shopRes = await axios.post(`${server}/api/v2/shops/become-seller`, shopForm, shopConfig);
        
        if (shopRes.data.success) {
          console.log('✅ Shop created successfully:', shopRes.data);
          
          toast.success(t("signup.sellerAccountShopCreatedSuccessfully", "Seller account and shop created successfully! Welcome!"));
          
          // Update user data in Redux store with the returned user
          if (shopRes.data.user) {
            dispatch({
              type: "LoadUserSuccess",
              payload: shopRes.data.user,
            });
            console.log('✅ User data updated in Redux:', shopRes.data.user);
          } else {
            // Fallback: load user from API
            await dispatch(loadUser());
          }
          
          // Small delay before redirect to ensure Redux is updated
          setTimeout(() => {
            // Always redirect to dashboard for sellers
            console.log('✅ Redirecting seller to dashboard');
            
            if (!shopRes.data.shop.isApproved) {
              toast.info(t("signup.shopPendingApproval", "Your shop is pending approval. You'll be notified once it's approved."));
            } else {
              toast.success(t("signup.shopApprovedWelcome", "Your shop is approved! Welcome to your dashboard."));
            }
            
            navigate("/dashboard");
          }, 300);
        }
      }
    } catch (error) {
      console.error('Seller registration error:', error);
      toast.error(error.response?.data?.message || t("signup.sellerRegistrationFailed", "Seller registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-50 py-8 px-4 sm:px-6 lg:px-8 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ minHeight: "100vh" }}
    >
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/3 -right-20 w-60 h-60 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-3000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-4">
            <Link to="/" className="inline-block">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                <img 
                  src={atlasLogo} 
                  alt="Atlas Ecom" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            </Link>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            {t("signup.title", "Create Your Account")}
          </h2>
          <p className="text-gray-600 text-sm">
            {t("signup.subtitle", "Join us and start your journey today")}
          </p>
        </div>

        {/* Account Type Selection & Google Signup */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-6 mb-8 animate-slide-up">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t("signup.chooseAccountType", "Choose Your Account Type")}</h3>
          </div>
          
          <div className="flex justify-center space-x-4 mb-6">
            {/* Customer Option */}
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                userType === "customer" 
                  ? "bg-red-500 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => selectAccountType("customer")}
            >
              {t("signup.customerAccount", "Customer Account")}
            </button>

            {/* Seller Option */}
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                userType === "seller" 
                  ? "bg-red-500 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => selectAccountType("seller")}
            >
              {t("signup.sellerAccount", "Seller Account")}
            </button>
          </div>

        </div>

        {/* Customer Registration Form */}
        {userType === "customer" && (
          <div ref={customerFormRef} className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 mb-8 animate-slide-up">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("signup.customerRegistration", "Customer Registration")}</h3>
            <p className="text-gray-600">{t("signup.customerRegistrationSubtitle", "Create your customer account to start shopping")}</p>
          </div>

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mb-6 flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FcGoogle size={20} />
            <span className="text-sm font-medium text-gray-700">
              {t("signup.continueWithGoogle", "Continue with Google")}
            </span>
          </button>

          <div className="relative mb-6">
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <div className="mx-4">
                <span className="text-sm text-gray-500 font-medium">
                  {t("signup.orContinueWith", "Or continue with email")}
                </span>
              </div>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleCustomerSubmit}>
            {/* Name */}
            <div className="group">
              <label htmlFor="customer-name" className="block text-sm font-semibold text-gray-700 mb-2">
                {t("signup.fullName", "Full Name")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customer-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("signup.fullNamePlaceholder", "Enter your full name")}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white"
              />
            </div>

            {/* Email */}
            <div className="group">
              <label htmlFor="customer-email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t("signup.email", "Email Address")} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  id="customer-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("signup.emailPlaceholder", "Enter your email address")}
                  className="flex-1 min-w-0 px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={sendingCode || !email || emailVerified}
                  className="flex-shrink-0 px-3 sm:px-4 py-3 sm:py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-xs sm:text-sm font-medium w-[90px] sm:w-[110px] flex items-center justify-center"
                >
                  {sendingCode ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : emailVerified ? (
                    t("signup.verified", "✓ Verified")
                  ) : (
                    t("signup.sendCode", "Send Code")
                  )}
                </button>
              </div>
              {emailVerified && (
                <p className="text-sm text-green-600 mt-1">{t("signup.emailVerifiedSuccess", "✓ Email verified successfully!")}</p>
              )}
            </div>

            {/* Email Verification Code */}
            {codeSent && !emailVerified && (
              <div className="group">
                <label htmlFor="verification-code" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("signup.verificationCode", "Verification Code")} <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t("signup.verificationCodePlaceholder", "Enter 6-digit code")}
                    maxLength={6}
                    className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={verificationCode.length !== 6}
                    className="px-4 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {t("signup.verify", "Verify")}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {t("signup.checkEmailForCode", "Check your email for the 6-digit verification code")}
                </p>
              </div>
            )}

            {/* Password */}
            <div className="group">
              <label htmlFor="customer-password" className="block text-sm font-semibold text-gray-700 mb-2">
                {t("signup.password", "Password")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  id="customer-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("signup.passwordPlaceholder", "Enter your password")}
                  className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label htmlFor="customer-confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
                {t("signup.confirmPassword", "Confirm Password")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={confirmVisible ? "text" : "password"}
                  id="customer-confirm-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("signup.confirmPasswordPlaceholder", "Confirm your password")}
                  className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                    confirmPassword && password !== confirmPassword 
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                      : confirmPassword && password === confirmPassword
                      ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setConfirmVisible(!confirmVisible)}
                >
                  {confirmVisible ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{t("signup.passwordsDoNotMatch", "Passwords do not match")}</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-sm text-green-600 mt-1">{t("signup.passwordsMatch", "✓ Passwords match")}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="group">
              <label htmlFor="customer-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                {t("signup.phoneNumber", "Phone Number")}
              </label>
              <input
                type="tel"
                id="customer-phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t("signup.phoneNumberPlaceholder", "Enter your phone number (optional)")}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white"
              />
            </div>

            {/* Address */}
            <div className="group">
              <label htmlFor="customer-address" className="block text-sm font-semibold text-gray-700 mb-2">
                {t("signup.address", "Address")}
              </label>
              <input
                type="text"
                id="customer-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("signup.addressPlaceholder", "Enter your address (optional)")}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white"
              />
            </div>

            {/* Avatar */}
            <div className="group">
              <label htmlFor="customer-avatar" className="block text-sm font-semibold text-gray-700 mb-2">
                {t("signup.avatar", "Profile Picture")}
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <span className="inline-block h-16 w-16 rounded-full overflow-hidden ring-2 ring-gray-200 shadow-lg">
                    {avatar ? (
                      <img
                        src={URL.createObjectURL(avatar)}
                        alt="Profile picture preview"
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <Avatar user={{ name: name || 'User' }} size="lg" className="h-full w-full" />
                    )}
                  </span>
                </div>
                <label
                  htmlFor="customer-avatar"
                  className="flex items-center justify-center px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-gray-50/50 hover:bg-white hover:border-red-400 transition-all duration-300 cursor-pointer group"
                >
                  <svg className="w-5 h-5 mr-2 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="group-hover:text-red-600 transition-colors duration-200">
                    {t("signup.uploadFile", "Upload Avatar")}
                  </span>
                  <input
                    type="file"
                    id="customer-avatar"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !emailVerified || !password || !confirmPassword || password !== confirmPassword}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="font-semibold">{t("signup.creatingAccount", "Creating Account...")}</span>
                </div>
              ) : (
                <span className="font-semibold">{t("signup.createCustomerAccount", "Create Customer Account")}</span>
              )}
            </button>
          </form>
        </div>
        )}

        {/* Seller Registration Form */}
        {userType === "seller" && (
          <div ref={sellerFormRef} className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 mb-8 animate-slide-up">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("signup.sellerRegistration", "Seller Registration")}</h3>
            <p className="text-gray-600">{t("signup.sellerRegistrationSubtitle", "Create your seller account and shop to start selling")}</p>
          </div>

          <form className="space-y-6" onSubmit={handleSellerSubmit}>
            {/* User Information Section */}
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t("signup.personalInformation", "Personal Information")}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="seller-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("signup.fullName", "Full Name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="seller-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("signup.enterFullName", "Enter your full name")}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="seller-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("signup.emailAddress", "Email Address")} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      id="seller-email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("signup.enterEmailAddress", "Enter your email address")}
                      className="flex-1 min-w-0 px-3 sm:px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={sendingCode || !email || emailVerified}
                      className="flex-shrink-0 px-3 sm:px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-xs sm:text-sm font-medium w-[90px] sm:w-[110px] flex items-center justify-center"
                    >
                      {sendingCode ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : emailVerified ? (
                        "✓ Verified"
                      ) : (
                        "Send Code"
                      )}
                    </button>
                  </div>
                  {emailVerified && (
                    <p className="text-sm text-green-600 mt-1">✓ Email verified successfully!</p>
                  )}
                </div>

                <div>
                  <label htmlFor="seller-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("signup.password", "Password")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={visible ? "text" : "password"}
                      id="seller-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("signup.enterPassword", "Enter your password")}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      onClick={() => setVisible(!visible)}
                    >
                      {visible ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="seller-confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("signup.confirmPassword", "Confirm Password")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={confirmVisible ? "text" : "password"}
                      id="seller-confirm-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("signup.confirmYourPassword", "Confirm your password")}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                        confirmPassword && password !== confirmPassword 
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                          : confirmPassword && password === confirmPassword
                          ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                          : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      onClick={() => setConfirmVisible(!confirmVisible)}
                    >
                      {confirmVisible ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-sm text-green-600 mt-1">✓ Passwords match</p>
                  )}
                </div>

                {/* Email Verification Code */}
                {codeSent && !emailVerified && (
                  <div className="col-span-2">
                    <label htmlFor="seller-verification-code" className="block text-sm font-semibold text-gray-700 mb-2">
                      Verification Code <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        id="seller-verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        disabled={verificationCode.length !== 6}
                        className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Verify
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Check your email for the 6-digit verification code
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Shop Information Section */}
            <div className="bg-green-50 p-6 rounded-xl mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t("signup.shopInformation", "Shop Information")}</h4>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="shop-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("signup.shopName", "Shop Name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="shop-name"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder={t("signup.enterShopName", "Enter your shop name")}
                    maxLength={50}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">{shopName ? `${shopName.length}/50 ${t("signup.characters", "characters")}` : `0/50 ${t("signup.characters", "characters")}`}</p>
                </div>

                <div>
                  <label htmlFor="shop-description" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("signup.businessDescription", "Business Description")}
                  </label>
                  <textarea
                    id="shop-description"
                    rows="3"
                    value={shopDescription}
                    onChange={(e) => setShopDescription(e.target.value)}
                    placeholder={t("signup.tellCustomersAboutBusiness", "Tell customers about your business...")}
                    maxLength={500}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">{shopDescription ? `${shopDescription.length}/500 ${t("signup.characters", "characters")}` : `0/500 ${t("signup.characters", "characters")}`}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="shop-address" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("signup.businessAddress", "Business Address")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="shop-address"
                      required
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      placeholder={t("signup.enterBusinessAddress", "Enter your business address")}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="shop-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("signup.shopPhone", "Shop Phone")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="shop-phone"
                      required
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      placeholder="06XXXXXXXX or 07XXXXXXXX"
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                        shopPhone && !validateMoroccanPhone(shopPhone)
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : shopPhone && validateMoroccanPhone(shopPhone)
                          ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                          : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                      }`}
                    />
                    {shopPhone && !validateMoroccanPhone(shopPhone) && (
                      <p className="text-sm text-red-500 mt-1">{t("signup.validMoroccanPhone", "Please enter a valid Moroccan phone number (06xxxxxxxx or 07xxxxxxxx)")}</p>
                    )}
                    {shopPhone && validateMoroccanPhone(shopPhone) && (
                      <p className="text-sm text-green-600 mt-1">✓ {formatMoroccanPhone(shopPhone)}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="zip-code" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("signup.zipCode", "Zip Code")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="zip-code"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder={t("signup.enterZipCode", "Enter zip code")}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="telegram" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("signup.telegramOptional", "Telegram (Optional)")}
                    </label>
                    <input
                      type="text"
                      id="telegram"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder={t("signup.enterTelegramUsername", "e.g. myshopgroup or username")}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone Verification */}
                {shopPhone && validateMoroccanPhone(shopPhone) && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-blue-800">{t("signup.whatsappVerification", "WhatsApp Verification")}</span>
                      </div>
                      {phoneVerified && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-xs font-medium">{t("signup.verified", "Verified")}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={handleSendPhoneCode}
                          disabled={sendingPhoneCode || phoneVerified}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            phoneVerified
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : sendingPhoneCode
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          }`}
                        >
                          {sendingPhoneCode ? t("signup.sending", "Sending...") : phoneVerified ? t("signup.codeSent", "Code Sent") : t("signup.sendWhatsappCode", "Send WhatsApp Code")}
                        </button>
                      </div>
                      
                      {phoneCodeSent && !phoneVerified && (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={phoneVerificationCode}
                            onChange={(e) => setPhoneVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder={t("signup.enterCodeFromWhatsapp", "Enter 6-digit code from WhatsApp")}
                            maxLength={6}
                            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyPhone}
                            disabled={phoneVerificationCode.length !== 6}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {t("signup.verify", "Verify")}
                          </button>
                        </div>
                      )}
                      
                      <p className="text-xs text-blue-600">
                        {t("signup.weWillSendCode", "We'll send a 6-digit verification code to your WhatsApp number:")} {formatMoroccanPhone(shopPhone)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Profile Picture */}
                <div>
                  <label htmlFor="seller-avatar" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("signup.profilePicture", "Profile Picture")}
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <span className="inline-block h-16 w-16 rounded-full overflow-hidden ring-2 ring-gray-200 shadow-lg">
                        {avatar ? (
                          <img
                            src={URL.createObjectURL(avatar)}
                            alt="Profile picture preview"
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <Avatar user={{ name: name || 'User' }} size="lg" className="h-full w-full" />
                        )}
                      </span>
                    </div>
                    <label
                      htmlFor="seller-avatar"
                      className="flex items-center justify-center px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-gray-50/50 hover:bg-white hover:border-green-400 transition-all duration-300 cursor-pointer group"
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="group-hover:text-green-600 transition-colors duration-200">
                        {t("signup.uploadProfilePicture", "Upload Profile Picture")}
                      </span>
                      <input
                        type="file"
                        id="seller-avatar"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !emailVerified || !phoneVerified || !password || !confirmPassword || password !== confirmPassword}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3.5 px-4 rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="font-semibold">{t("signup.creatingSellerAccount", "Creating Seller Account...")}</span>
                </div>
              ) : (
                <span className="font-semibold">{t("signup.createSellerAccount", "Create Seller Account")}</span>
              )}
            </button>
          </form>
        </div>
        )}

        {/* Sign In Link */}
        <div className="text-center mt-8 animate-fade-in-delayed">
          <p className="text-sm text-gray-600">
            {t("signup.haveAccount", "Already have an account?")}{" "}
            <Link
              to="/login"
              className="font-bold text-red-600 hover:text-red-500 transition-colors duration-200 hover:underline"
            >
              {t("signup.signIn", "Sign in here")}
            </Link>
          </p>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            {t("signup.backToHome", "Back to Home")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSignup;
