import React, { useEffect, useState } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import ProductDetails from "../components/Products/ProductDetails";
import { useParams, useSearchParams } from 'react-router-dom';
import SuggestedProduct from "../components/Products/SuggestedProduct";
import RelatedEvents from "../components/Products/RelatedEvents";
import ReviewsSection from "../components/Products/ReviewsSection";
import { useSelector, useDispatch } from 'react-redux';
import { getAllEvents } from '../redux/actions/event';
import { getAllProducts } from '../redux/actions/product';
import axios from 'axios';
import { server } from '../server';



const ProductDetailsPage = () => {
    const { allProducts } = useSelector((state) => state.products);
    const { allEvents } = useSelector((state) => state.events);
    const { id } = useParams();
    const [data, setData] = useState(null)
    const [searchParams] = useSearchParams();
    const eventData = searchParams.get("isEvent");
    const dispatch = useDispatch();


    useEffect(()=>{
        dispatch(getAllEvents());
        dispatch(getAllProducts())
    },[dispatch])

    // const productName = name.replace(/-/g, " ");

    useEffect(() => {
        console.log("ProductDetailsPage useEffect triggered");
        console.log("ID from params:", id);
        console.log("eventData:", eventData);
        
        const fetchProductData = async () => {
            try {
                if (eventData !== null) {
                    // For events, try to find in allEvents first, then fetch directly
                    let data = allEvents && allEvents.find((i) => i._id === id);
                    
                    if (!data) {
                        // Fetch event directly from API
                        const response = await axios.get(`${server}/events/${id}`);
                        data = response.data.event;
                    }
                    
                    console.log("Found event data:", data);
                    console.log("Event images:", data?.images);
                    setData(data);
                    
                    // Track event view
                    if (data?._id) {
                        axios.post(`${server}/api/track/event/${data._id}/view`).catch(err => 
                            console.log('Analytics tracking failed:', err)
                        );
                    }
                } else {
                    // For products, try to find in allProducts first, then fetch directly
                    let data = allProducts && allProducts.find((i) => i._id === id);
                    
                    if (!data) {
                        // Fetch product directly from API
                        const response = await axios.get(`${server}/products/${id}`);
                        data = response.data.product;
                    }
                    
                    console.log("Found product data:", data);
                    console.log("Product images:", data?.images);
                    setData(data);
                    
                    // Track product view
                    if (data?._id) {
                        axios.post(`${server}/api/track/product/${data._id}/view`).catch(err => 
                            console.log('Analytics tracking failed:', err)
                        );
                    }
                }
            } catch (error) {
                console.error("Error fetching product/event data:", error);
                setData(null);
            }
        };
        
        if (id) {
            fetchProductData();
        }
        // Scroll to top is now handled globally by ScrollToTop component
        }, [id, eventData, allProducts, allEvents]);



    return (
        <div>
            <Header />
            <ProductDetails data={data} isEvent={eventData !== null} />
            
            {/* Reviews Section */}
            {data && <ReviewsSection data={data} isEvent={eventData !== null} />}
            
            {/* Related Products/Events Section */}
            {
                !eventData ? (
                    // Show related products for regular products
                    data && <SuggestedProduct data={data} />
                ) : (
                    // Show related events for events
                    data && <RelatedEvents data={data} />
                )
            }
            <Footer />
        </div>
    )
}

export default ProductDetailsPage
