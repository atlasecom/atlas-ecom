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
        console.log("allProducts:", allProducts);
        console.log("allEvents:", allEvents);
        console.log("eventData:", eventData);
        
        if (eventData !== null) {
            const data = allEvents && allEvents.find((i) => i._id === id);
            console.log("Found event data:", data);
            console.log("Event images:", data?.images);
            setData(data);
        } else {
            const data = allProducts && allProducts.find((i) => i._id === id);
            console.log("Found product data:", data);
            console.log("Product images:", data?.images);
            setData(data);
        }
        /* `window.scrollTo(0, 0)` is a JavaScript method that scrolls the window to the top of the page.
        In this code, it is used inside the `useEffect` hook to scroll the window to the top whenever
        the component is rendered. This ensures that when the user navigates to the
        `ProductDetailsPage`, the page starts at the top rather than at the previous scroll position. */
        window.scrollTo(0, 0)
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
