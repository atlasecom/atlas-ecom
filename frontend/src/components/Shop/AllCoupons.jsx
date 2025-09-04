import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAuthToken } from "../../utils/auth";

const AllCoupons = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [coupouns, setCoupouns] = useState([]);
    const [minAmount, setMinAmout] = useState(null);
    const [maxAmount, setMaxAmount] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [value, setValue] = useState(null);
    const { user } = useSelector((state) => state.user);
    const { products } = useSelector((state) => state.products);
    const { t, i18n } = useTranslation();

    const dispatch = useDispatch();

    useEffect(() => {
        setIsLoading(true);
        const token = getAuthToken();
        axios
            .get(`${server}/coupon/get-coupon/${user.shop._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setIsLoading(false);
                setCoupouns(res.data.couponCodes);
            })
            .catch((error) => {
                setIsLoading(false);
            });
    }, [dispatch]);

    const handleDelete = async (id) => {
        const token = getAuthToken();
        axios.delete(`${server}/coupon/delete-coupon/${id}`, { 
            headers: { Authorization: `Bearer ${token}` } 
        }).then((res) => {
            toast.success(t('allCoupons.couponDeleted', 'Coupon code deleted successfully!'))
        })
        window.location.reload();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = getAuthToken();
        await axios
            .post(
                `${server}/coupon/create-coupon-code`,
                {
                    name,
                    minAmount,
                    maxAmount,
                    selectedProducts,
                    value,
                    shopId: user.shop._id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                toast.success(t('allCoupons.couponCreated', 'Coupon code created successfully!'));
                setOpen(false);
                window.location.reload();
            })
            .catch((error) => {
                toast.error(error.response.data.message);
            });
    };

    const columns = [
        { field: "id", headerName: t('allCoupons.id', 'Id'), minWidth: 150, flex: 0.7 },
        {
            field: "name",
            headerName: t('allCoupons.couponCode', 'Coupon Code'),
            minWidth: 180,
            flex: 1.4,
        },
        {
            field: "price",
            headerName: t('allCoupons.value', 'Value'),
            minWidth: 100,
            flex: 0.6,
        },
        {
            field: "Delete",
            flex: 0.8,
            minWidth: 120,
            headerName: t('allCoupons.delete', 'Delete'),
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Button onClick={() => handleDelete(params.id)}>
                            <AiOutlineDelete size={20} />
                        </Button>
                    </>
                );
            },
        },
    ];

    const row = [];

    coupouns &&
        coupouns.forEach((item) => {
            row.push({
                id: item._id,
                name: item.name,
                price: item.value + " %",
                sold: 10,
            });
        });

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div className={`w-full mx-8 pt-1 mt-10 bg-white ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
                    <div className={`w-full flex ${i18n.language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                        <div
                            className={`${styles.button} !w-max !h-[45px] px-3 !rounded-[5px] ${i18n.language === 'ar' ? 'ml-3' : 'mr-3'} mb-3 cursor-pointer`}
                            onClick={() => setOpen(true)}
                        >
                            <span className="text-white">{t('allCoupons.createCouponCode', 'Create Coupon Code')}</span>
                        </div>
                    </div>
                    <DataGrid
                        rows={row}
                        columns={columns}
                        pageSize={10}
                        disableSelectionOnClick
                        autoHeight
                        localeText={{
                            noRowsLabel: t('allCoupons.noRows', 'No rows'),
                        }}
                    />
                    {open && (
                        <div className="fixed top-0 left-0 w-full h-screen bg-[#00000062] z-[20000] flex items-center justify-center">
                            <div className={`w-[90%] 800px:w-[40%] h-[80vh] bg-white rounded-md shadow p-4 ${
                                i18n.language === 'ar' ? 'rtl' : 'ltr'
                            }`}>
                                <div className={`w-full flex ${i18n.language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                                    <RxCross1
                                        size={30}
                                        className="cursor-pointer"
                                        onClick={() => setOpen(false)}
                                    />
                                </div>
                                <h5 className="text-[30px] font-Poppins text-center">
                                    {t('allCoupons.createCouponTitle', 'Create Coupon code')}
                                </h5>
                                {/* create coupoun code */}
                                <form onSubmit={handleSubmit} aria-required={true}>

                                    <div>
                                        <label className="pb-2">
                                            {t('allCoupons.name', 'Name')} <span className="text-red-500">{t('allCoupons.required', '*')}</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={name}
                                            className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                                            }`}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder={t('allCoupons.namePlaceholder', 'Enter your coupon code name...')}
                                        />
                                    </div>

                                    <div>
                                        <label className="pb-2">
                                            {t('allCoupons.discountPercentage', 'Discount Percentage')}{" "}
                                            <span className="text-red-500">{t('allCoupons.required', '*')}</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="value"
                                            value={value}
                                            required
                                            className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                                            }`}
                                            onChange={(e) => setValue(e.target.value)}
                                            placeholder={t('allCoupons.discountPlaceholder', 'Enter your coupon code value...')}
                                        />
                                    </div>

                                    <div>
                                        <label className="pb-2">{t('allCoupons.minAmount', 'Min Amount')}</label>
                                        <input
                                            type="number"
                                            name="value"
                                            value={minAmount}
                                            className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                                            }`}
                                            onChange={(e) => setMinAmout(e.target.value)}
                                            placeholder={t('allCoupons.minAmountPlaceholder', 'Enter your coupon code min amount...')}
                                        />
                                    </div>

                                    <div>
                                        <label className="pb-2">{t('allCoupons.maxAmount', 'Max Amount')}</label>
                                        <input
                                            type="number"
                                            name="value"
                                            value={maxAmount}
                                            className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                                            }`}
                                            onChange={(e) => setMaxAmount(e.target.value)}
                                            placeholder={t('allCoupons.maxAmountPlaceholder', 'Enter your coupon code max amount...')}
                                        />
                                    </div>

                                    <div>
                                        <label className="pb-2">{t('allCoupons.selectedProduct', 'Selected Product')}</label>
                                        <select
                                            className={`w-full mt-2 border h-[35px] rounded-[5px] ${
                                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                                            }`}
                                            value={selectedProducts}
                                            onChange={(e) => setSelectedProducts(e.target.value)}
                                        >
                                            <option value="Choose your selected products">
                                                {t('allCoupons.chooseProduct', 'Choose a selected product')}
                                            </option>
                                            {products &&
                                                products.map((i) => (
                                                    <option value={i.name} key={i.name}>
                                                        {i.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <input
                                            type="submit"
                                            value={t('allCoupons.create', 'Create')}
                                            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default AllCoupons;