import React from 'react';
import styled from 'styled-components';

// Social Buttons Component
const SocialButtons = () => {
  return (
    <SocialStyledWrapper>
      <ul className="wrapper">
        <li className="icon facebook">
          <span className="tooltip">Facebook</span>
          <svg viewBox="0 0 320 512" height="1.2em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
          </svg>
        </li>
        <li className="icon twitter">
          <span className="tooltip">Twitter</span>
          <svg height="1.8em" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="twitter">
            <path d="M42,12.429c-1.323,0.586-2.746,0.977-4.247,1.162c1.526-0.906,2.7-2.351,3.251-4.058c-1.428,0.837-3.01,1.452-4.693,1.776C34.967,9.884,33.05,9,30.926,9c-4.08,0-7.387,3.278-7.387,7.32c0,0.572,0.067,1.129,0.193,1.67c-6.138-0.308-11.582-3.226-15.224-7.654c-0.64,1.082-1,2.349-1,3.686c0,2.541,1.301,4.778,3.285,6.096c-1.211-0.037-2.351-0.374-3.349-0.914c0,0.022,0,0.055,0,0.086c0,3.551,2.547,6.508,5.923,7.181c-0.617,0.169-1.269,0.263-1.941,0.263c-0.477,0-0.942-0.054-1.392-0.135c0.94,2.902,3.667,5.023,6.898,5.086c-2.528,1.96-5.712,3.134-9.174,3.134c-0.598,0-1.183-0.034-1.761-0.104C9.268,36.786,13.152,38,17.321,38c13.585,0,21.017-11.156,21.017-20.834c0-0.317-0.01-0.633-0.025-0.945C39.763,15.197,41.013,13.905,42,12.429" />
          </svg>
        </li>
        <li className="icon instagram">
          <span className="tooltip">Instagram</span>
          <svg xmlns="http://www.w3.org/2000/svg" height="1.2em" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
          </svg>
        </li>
      </ul>
    </SocialStyledWrapper>
  );
};

// Styled wrapper for social buttons
const SocialStyledWrapper = styled.div`
  .wrapper {
    display: inline-flex;
    list-style: none;
    height: auto; /* Adjusted to fit layout */
    width: 100%;
    padding-top: 0; /* Adjusted to fit layout */
    font-family: "Poppins", sans-serif;
    justify-content: center;
  }

  .wrapper .icon {
    position: relative;
    background: #fff; /* Matches profile's light icons */
    border-radius: 50%;
    margin: 10px;
    width: 50px;
    height: 50px;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .wrapper .tooltip {
    position: absolute;
    top: 0;
    font-size: 14px;
    background: #fff;
    color: #fff;
    padding: 5px 8px;
    border-radius: 5px;
    box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .wrapper .tooltip::before {
    position: absolute;
    content: "";
    height: 8px;
    width: 8px;
    background: #fff;
    bottom: -3px;
    left: 50%;
    transform: translate(-50%) rotate(45deg);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .wrapper .icon:hover .tooltip {
    top: -45px;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .wrapper .icon:hover span,
  .wrapper .icon:hover .tooltip {
    text-shadow: 0px -1px 0px rgba(0, 0, 0, 0.1);
  }

  .wrapper .facebook:hover,
  .wrapper .facebook:hover .tooltip,
  .wrapper .facebook:hover .tooltip::before {
    background: #1877f2;
    color: #fff;
  }

  .wrapper .twitter:hover,
  .wrapper .twitter:hover .tooltip,
  .wrapper .twitter:hover .tooltip::before {
    background: #1da1f2;
    color: #fff;
  }

  .wrapper .instagram:hover,
  .wrapper .instagram:hover .tooltip,
  .wrapper .instagram:hover .tooltip::before {
    background: #e4405f;
    color: #fff;
  }
`;

const Profile = () => {
  const recentPurchases = [
    { id: 1, name: 'Wireless Headphones', price: '$199.99', date: '2023-12-15', status: 'Delivered' },
    { id: 2, name: 'Smart Watch Pro', price: '$299.50', date: '2023-12-10', status: 'Shipped' },
    { id: 3, name: 'Gaming Keyboard', price: '$149.00', date: '2023-12-05', status: 'Processing' },
    { id: 4, name: '4K Webcam', price: '$89.99', date: '2023-11-28', status: 'Delivered' },
  ];

  return (
    <div className="min-h-screen py-8 text-gray-100 bg-gray-900">
      <div className="max-w-6xl px-4 mx-auto">
        {/* Profile Header */}
        <div className="overflow-hidden bg-gray-800 shadow-xl rounded-3xl">
          <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-500">
            <div className="absolute flex items-end space-x-6 -bottom-16 left-8">
              <img 
                src="https://randomuser.me/api/portraits/men/75.jpg" 
                alt="Profile" 
                className="w-32 h-32 border-4 border-gray-800 rounded-full shadow-lg"
              />
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Harry Horwitz</h1>
                <p className="flex items-center text-gray-400">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                  New York, USA
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end px-8 pt-20 pb-8">
            <div className="flex space-x-4">
              <button className="flex items-center px-6 py-2 transition-all bg-purple-600 rounded-full hover:bg-purple-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
              <button className="flex items-center px-6 py-2 transition-all bg-gray-700 rounded-full hover:bg-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
          <div className="p-6 bg-gray-800 rounded-xl">
            <h3 className="text-sm text-gray-400">Total Purchases</h3>
            <p className="mt-2 text-3xl font-bold">$1,234.56</p>
            <div className="w-1/3 h-1 mt-4 bg-purple-600 rounded-full"/>
          </div>
          <div className="p-6 bg-gray-800 rounded-xl">
            <h3 className="text-sm text-gray-400">Completed Orders</h3>
            <p className="mt-2 text-3xl font-bold">42</p>
            <div className="w-1/3 h-1 mt-4 bg-blue-500 rounded-full"/>
          </div>
          <div className="p-6 bg-gray-800 rounded-xl">
            <h3 className="text-sm text-gray-400">Wishlist Items</h3>
            <p className="mt-2 text-3xl font-bold">15</p>
            <div className="w-1/3 h-1 mt-4 bg-green-500 rounded-full"/>
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="p-6 mt-8 bg-gray-800 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Purchases</h2>
            <button className="flex items-center text-purple-500 hover:text-purple-400">
              View All
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {recentPurchases.map(purchase => (
              <div key={purchase.id} className="flex items-center justify-between p-4 transition-all bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">{purchase.name}</h3>
                    <p className="text-sm text-gray-400">{purchase.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{purchase.price}</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    purchase.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                    purchase.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {purchase.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-2">
          <div className="p-6 bg-gray-800 rounded-xl">
            <h2 className="mb-4 text-xl font-bold">About</h2>
            <p className="leading-relaxed text-gray-400">
              Tech enthusiast and digital creator. Passionate about cutting-edge technology and user experience design. 
              Currently working as a full-stack developer while exploring new opportunities in the blockchain space.
            </p>
          </div>

          <div className="p-6 bg-gray-800 rounded-xl">
            <h2 className="mb-4 text-xl font-bold">Social Connections</h2>
            <SocialButtons />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;