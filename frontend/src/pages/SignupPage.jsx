import React, { useEffect } from 'react'
import UnifiedSignup from '../components/Signup/UnifiedSignup'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SignupPage = () => {

    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.user);
    // if user is login then redirect to home page
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    })

    return (
        <div>
            <UnifiedSignup />
        </div>
    )
}

export default SignupPage