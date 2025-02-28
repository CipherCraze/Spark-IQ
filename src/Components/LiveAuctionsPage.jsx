import { useState, useEffect } from "react";
import { Clock, Gavel, Flame, TrendingUp, Wallet } from "lucide-react";

export default function Auction() {
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour in seconds
  const [currentBid, setCurrentBid] = useState(125);
  const [bidAmount, setBidAmount] = useState("");
  const [biddingHistory, setBiddingHistory] = useState([
    { amount: 100, user: "CampusPro", time: "2 hours ago" },
    { amount: 110, user: "StudyBuddy", time: "1.5 hours ago" },
    { amount: 125, user: "BookWorm", time: "45 mins ago" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (bidAmount > currentBid) {
      setCurrentBid(bidAmount);
      setBiddingHistory([
        {
          amount: Number(bidAmount),
          user: "You",
          time: "Just now",
        },
        ...biddingHistory,
      ]);
      setBidAmount("");
    }
  };

  return (
    <section className="min-h-screen pt-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container px-4 mx-auto">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="flex items-center justify-center gap-3 mb-4 text-4xl font-bold text-blue-400">
            <Gavel className="w-8 h-8" /> Live Auctions
          </h1>
          <p className="max-w-2xl mx-auto text-gray-300">
            Bid on exclusive campus items and win amazing deals! Place your bids
            strategically and watch the auction heat up in real-time.
          </p>
        </div>

        {/* Auction Grid */}
        <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Auction Item 1 */}
          <div className="p-6 transition-shadow bg-gray-800 rounded-xl hover:shadow-2xl">
            <div className="relative mb-4">
              <img
                src="https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Auction Item"
                className="object-cover w-full h-48 rounded-lg"
              />
              <div className="absolute flex items-center px-3 py-1 text-sm text-white bg-red-500 rounded-full top-2 right-2">
                <Flame className="w-4 h-4 mr-1" /> HOT
              </div>
            </div>

            <h3 className="mb-2 text-xl font-semibold text-white">
              Exam Resources
            </h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-blue-400">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="flex items-center text-green-400">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="font-medium">${currentBid}</span>
              </div>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div className="relative">
                <Wallet className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={currentBid + 1}
                  step="1"
                  placeholder={`Enter bid (min $${currentBid + 1})`}
                  className="w-full py-3 pl-10 pr-4 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <Gavel className="w-5 h-5" /> Place Bid
              </button>
            </form>

            {/* Bidding History */}
            <div className="pt-4 mt-6 border-t border-gray-700">
              <h4 className="mb-3 font-medium text-gray-300">Bidding History</h4>
              <div className="space-y-3">
                {biddingHistory.map((bid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50"
                  >
                    <div>
                      <span className="font-medium text-blue-400">
                        ${bid.amount}
                      </span>
                      <span className="ml-2 text-sm text-gray-400">
                        by {bid.user}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">{bid.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Auction Item 2 */}
          <div className="p-6 transition-shadow bg-gray-800 rounded-xl hover:shadow-2xl">
            <div className="relative mb-4">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Auction Item"
                className="object-cover w-full h-48 rounded-lg"
              />
              <div className="absolute flex items-center px-3 py-1 text-sm text-white bg-red-500 rounded-full top-2 right-2">
                <Flame className="w-4 h-4 mr-1" /> HOT
              </div>
            </div>

            <h3 className="mb-2 text-xl font-semibold text-white">
              Smart Watch
            </h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-blue-400">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="flex items-center text-green-400">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="font-medium">$75</span>
              </div>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div className="relative">
                <Wallet className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={76}
                  step="1"
                  placeholder="Enter bid (min $76)"
                  className="w-full py-3 pl-10 pr-4 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <Gavel className="w-5 h-5" /> Place Bid
              </button>
            </form>

            {/* Bidding History */}
            <div className="pt-4 mt-6 border-t border-gray-700">
              <h4 className="mb-3 font-medium text-gray-300">Bidding History</h4>
              <div className="space-y-3">
                {biddingHistory.map((bid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50"
                  >
                    <div>
                      <span className="font-medium text-blue-400">
                        ${bid.amount}
                      </span>
                      <span className="ml-2 text-sm text-gray-400">
                        by {bid.user}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">{bid.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Auction Item 3 */}
          <div className="p-6 transition-shadow bg-gray-800 rounded-xl hover:shadow-2xl">
            <div className="relative mb-4">
              <img
                src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Auction Item"
                className="object-cover w-full h-48 rounded-lg"
              />
              <div className="absolute flex items-center px-3 py-1 text-sm text-white bg-red-500 rounded-full top-2 right-2">
                <Flame className="w-4 h-4 mr-1" /> HOT
              </div>
            </div>

            <h3 className="mb-2 text-xl font-semibold text-white">
              Laptop
            </h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-blue-400">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="flex items-center text-green-400">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="font-medium">$20</span>
              </div>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div className="relative">
                <Wallet className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={21}
                  step="1"
                  placeholder="Enter bid (min $21)"
                  className="w-full py-3 pl-10 pr-4 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <Gavel className="w-5 h-5" /> Place Bid
              </button>
            </form>

            {/* Bidding History */}
            <div className="pt-4 mt-6 border-t border-gray-700">
              <h4 className="mb-3 font-medium text-gray-300">Bidding History</h4>
              <div className="space-y-3">
                {biddingHistory.map((bid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50"
                  >
                    <div>
                      <span className="font-medium text-blue-400">
                        ${bid.amount}
                      </span>
                      <span className="ml-2 text-sm text-gray-400">
                        by {bid.user}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">{bid.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Auction Guidelines */}
        <div className="p-8 mb-12 bg-gray-800 rounded-xl">
          <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-blue-400">
            <Gavel className="w-6 h-6" /> Auction Rules
          </h2>
          <div className="grid gap-6 text-gray-300 md:grid-cols-2">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-400/20">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Time Limits</h3>
                <p className="text-sm">
                  Each auction has a fixed time limit. The highest bid when time
                  expires wins the item.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-400/20">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Minimum Increment</h3>
                <p className="text-sm">
                  Bids must exceed the current highest bid by at least $5. Automatic
                  bid increments apply.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
