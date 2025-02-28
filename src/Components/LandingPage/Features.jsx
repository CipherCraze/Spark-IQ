import { ShoppingCart, Gavel, Shield, Zap } from "lucide-react";
import styled from 'styled-components';

export default function Features() {
  const features = [
    {
      icon: <ShoppingCart className="w-12 h-12 text-green-500" />,
      title: "Easy Selling",
      description:
        "List your items quickly and reach the entire campus community with our user-friendly interface.",
    },
    {
      icon: <Gavel className="w-12 h-12 text-blue-500" />,
      title: "Dynamic Bidding",
      description:
        "Get the best deals by participating in our exciting and fair bidding system.",
    },
    {
      icon: <Shield className="w-12 h-12 text-purple-500" />,
      title: "Secure Transactions",
      description:
        "Enjoy peace of mind with our trusted and secure payment system for all your trades.",
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: "Instant Notifications",
      description:
        "Stay updated with real-time alerts on your bids, sales, and purchases.",
    },
  ];

  return (
    <section
      className="py-20 bg-gray-50 dark:bg-gray-900"
      role="region"
      aria-labelledby="features-heading"
    >
      <div className="container px-4 mx-auto">
        {/* Section Heading */}
        <h2
          id="features-heading"
          className="mb-16 text-4xl font-bold text-center text-gray-800 dark:text-gray-100"
        >
          Why Choose CampusMart?
        </h2>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="card2">
          {/* Icon */}
          <div className="flex justify-center mb-4 transition-transform duration-300 group-hover:rotate-12">
            {icon}
          </div>

          {/* Content Section */}
          <div className="content">
            {/* Title */}
            <h3 className="mb-2 text-xl font-semibold text-center text-gray-800 dark:text-gray-100">
              {title}
            </h3>

            {/* Description */}
            <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
              {description}
            </p>

            {/* Learn More Button */}
            <button className="block px-4 py-2 mx-auto mt-4 text-white rounded-full shadow-md bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:bg-gradient-to-l hover:from-indigo-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 100%;
    height: 254px;
    background-image: linear-gradient(163deg, #00ff75 0%, #3700ff 100%);
    border-radius: 20px;
    transition: all 0.3s ease;
    box-shadow: 0px 0px 20px rgba(0, 255, 117, 0.2);
  }

  .card2 {
    width: 100%;
    height: 100%;
    background-color: #1a1a1a;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
    transition: all 0.2s ease;
  }

  .card2:hover {
    transform: scale(0.98);
    border-radius: 20px;
  }

  .card:hover {
    box-shadow: 0px 0px 30px 1px rgba(0, 255, 117, 0.3);
    transform: scale(1.05);
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .content h3 {
    text-align: center;
  }

  .content p {
    text-align: center;
  }

  .content button {
    text-align: center;
  }
`;
