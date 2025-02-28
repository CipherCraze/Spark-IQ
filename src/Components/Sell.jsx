import { useState } from 'react';

export default function Sell() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('new');
  const [category, setCategory] = useState('other');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setErrors({ ...errors, images: 'Maximum 5 images allowed' });
      return;
    }
    setSelectedFiles(files);
    setErrors({ ...errors, images: '' });
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(
            `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`
          );
        },
        (error) => {
          setErrors({ ...errors, location: 'Unable to retrieve your location' });
        }
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newErrors = {};

    if (!formData.get('item-name')) newErrors.name = 'Item name is required';
    if (!formData.get('item-price')) newErrors.price = 'Price is required';
    if (selectedFiles.length === 0)
      newErrors.images = 'At least one image is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form data here (typically to an API)
    setShowSuccess(true);
  };

  return (
    <section className="min-h-screen px-4 py-16 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <br />
      <h1 className="mb-8 text-4xl font-extrabold text-center text-white">
        Sell Your Treasure
      </h1>
      <p className="mb-8 text-lg text-center text-gray-300">
        Turn your pre-loved items into someone else's find. List in just 2 minutes!
      </p>

      {showSuccess ? (
        <div className="max-w-lg p-8 mx-auto text-center bg-gray-800 rounded-lg shadow-xl">
          <div className="mb-4 text-6xl">🎉</div>
          <h2 className="mb-4 text-2xl font-bold text-white">
            Listing Successful!
          </h2>
          <p className="text-gray-300">
            Your item is now visible to the community. You'll be notified when someone shows interest.
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="px-6 py-3 mt-6 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-500"
          >
            List Another Item
          </button>
        </div>
      ) : (
        <div className="max-w-2xl p-8 mx-auto transition-all bg-gray-800 rounded-lg shadow-xl hover:shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Category Selection */}
            <div>
              <label className="block text-lg font-medium text-gray-300">
                Category
              </label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {['Electronics', 'Furniture', 'Clothing', 'Books', 'Toys', 'Other'].map((cat) => (
                  <label
                    key={cat}
                    className={`flex items-center p-3 rounded-md cursor-pointer ${
                      category === cat.toLowerCase()
                        ? 'bg-indigo-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.toLowerCase()}
                      checked={category === cat.toLowerCase()}
                      onChange={(e) => setCategory(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-white">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Item Details */}
            <div>
              <label
                htmlFor="item-name"
                className="block text-lg font-medium text-gray-300"
              >
                Item Name
              </label>
              <input
                type="text"
                id="item-name"
                name="item-name"
                required
                className="block w-full px-4 py-3 mt-2 text-white bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Vintage Leather Jacket"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Item Condition */}
            <div>
              <label className="block text-lg font-medium text-gray-300">
                Condition
              </label>
              <div className="flex gap-4 mt-2">
                {['New', 'Like New', 'Used', 'Vintage'].map((cond) => (
                  <label
                    key={cond}
                    className={`px-4 py-2 rounded-full cursor-pointer ${
                      condition === cond.toLowerCase()
                        ? 'bg-indigo-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={cond.toLowerCase()}
                      checked={condition === cond.toLowerCase()}
                      onChange={(e) => setCondition(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-white">{cond}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Image Upload with Preview */}
            <div>
              <label className="block text-lg font-medium text-gray-300">
                Upload Photos
              </label>
              <div className="flex flex-wrap gap-4 mt-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-full rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
                      }
                      className="absolute flex items-center justify-center w-5 h-5 text-white bg-red-500 rounded-full top-1 right-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="flex items-center justify-center w-24 h-24 transition-colors border-2 border-gray-500 border-dashed rounded-md cursor-pointer hover:border-indigo-500">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                  />
                  <span className="text-3xl text-gray-400">+</span>
                </label>
              </div>
              {errors.images && (
                <p className="mt-1 text-sm text-red-400">{errors.images}</p>
              )}
            </div>

            {/* Price Input */}
            <div>
              <label
                htmlFor="item-price"
                className="block text-lg font-medium text-gray-300"
              >
                Price
              </label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-400">$</span>
                </div>
                <input
                  type="number"
                  id="item-price"
                  name="item-price"
                  min="0"
                  step="0.01"
                  required
                  className="block w-full py-3 pl-8 pr-4 text-white bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-400">{errors.price}</p>
              )}
            </div>

            {/* Location Input */}
            <div>
              <label
                htmlFor="item-location"
                className="block text-lg font-medium text-gray-300"
              >
                Location
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  id="item-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 px-4 py-3 text-white bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter item location"
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  className="px-4 py-3 text-white transition-colors bg-gray-700 rounded-md hover:bg-gray-600"
                >
                  📍 Use Current
                </button>
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-400">{errors.location}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="ml-2 text-gray-300">
                I agree to the{' '}
                <a href="/terms" className="text-indigo-400 hover:text-indigo-300">
                  Terms of Service
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              ✨ Publish Listing
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
