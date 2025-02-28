import React from "react";
import { useNavigate } from "react-router";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import macImage from "./assets/images/mac.png";
import iphone from "./assets/images/iphone.png";
import airpode from "./assets/images/airpods.png";
import airpodemax from "./assets/images/airpods.png";
import ipad from "./assets/images/ipad.png";
import applewatch from "./assets/images/applewatch.png";
import macmini from "./assets/images/macmini.png";
import appletv from "./assets/images/appletv.png";

const hotDeals = [
  { id: 1, name: "MacBook Pro", price: "$2399", image: macImage },
  { id: 2, name: "AirPods Pro", price: "$199", image: airpode },
  { id: 3, name: "iPhone 16", price: "$1099", image: iphone },
  { id: 4, name: "iPad Pro", price: "$799", image: ipad },
  { id: 5, name: "Apple Watch Series 9", price: "$429", image: applewatch },
  { id: 6, name: "AirPods Max", price: "$549", image: airpodemax },
  { id: 7, name: "Mac Mini M2", price: "$599", image: macmini },
  { id: 8, name: "Apple TV 4K", price: "$129", image: appletv },
];

export default function HotDeals() {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    // Redirect to Login page
    navigate("/login");
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      { 
        breakpoint: 1024, 
        settings: { 
          slidesToShow: 2,
          arrows: false
        } 
      },
      { 
        breakpoint: 640, 
        settings: { 
          slidesToShow: 1,
          arrows: false
        } 
      }
    ]
  };

  return (
    <section className="py-16 bg-neutral-50 dark:bg-gray-900">
      <br></br>
      <div className="container px-4 mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-4xl font-bold text-gray-900 dark:text-white">
            Today's Special Offers
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover our exclusive limited-time offers
          </p>
        </div>

        <Slider {...settings} className="focus:outline-none">
          {hotDeals.map((deal) => (
            <div key={deal.id} className="px-2 focus:outline-none">
              <div className="overflow-hidden transition-shadow duration-300 bg-white shadow-lg group dark:bg-gray-800 rounded-xl hover:shadow-xl">
                <div className="relative bg-gray-100 h-60 dark:bg-gray-700">
                  <img 
                    src={deal.image}
                    alt={deal.name}
                    className="object-contain w-full h-full p-6 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {deal.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {deal.price}
                    </span>
                    <button
                      onClick={handleBuyNow}
                      className="px-6 py-2 font-medium text-white transition-colors duration-200 rounded-lg bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                      aria-label={`Buy ${deal.name} for ${deal.price}`}
                    >
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
