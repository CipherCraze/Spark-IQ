import { Link } from 'react-router';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Oops! The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;