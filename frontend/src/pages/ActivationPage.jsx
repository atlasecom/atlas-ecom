import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { server } from "../server";
import axios from 'axios';
import { useTranslation } from 'react-i18next';



const ActivationPage = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { activation_token } = useParams();
    const [error, setError] = useState(false);

    useEffect(() => {
        if (activation_token) {
            const activationEmail = async () => {
                try {
                    const res = await axios
                        .post(`${server}/user/activation`, {
                            activation_token
                        })
                    console.log(res.data.message);
                } catch (err) {
                    console.log(err.response.data.message);
                    setError(true);
                }
            }
            activationEmail();
        }

    }, []);

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
            className={isRTL ? 'rtl' : 'ltr'}
        >
            {
                error ? (
                    <p className={`text-red-800 text-center ${isRTL ? 'font-arabic' : ''}`}>
                        {t('activation.tokenExpired')}
                    </p>
                ) : (
                    <p className={`text-green-800 text-center ${isRTL ? 'font-arabic' : ''}`}>
                        {t('activation.accountCreatedSuccessfully')}
                    </p>
                )
            }

        </div>
    )
}

export default ActivationPage