import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Computer Science Sophomore",
      content:
        "campusMart revolutionized how I trade academic resources. The intuitive platform helped me offset textbook costs while connecting with trusted campus community members.",
      avatar: "/avatar1.jpg",
      rating: 5,
    },
    {
      name: "Samantha Lee",
      role: "Business Administration Junior",
      content:
        "The escrow payment system provides unparalleled transaction security. I've confidently completed over 15 exchanges this semester alone.",
      avatar: "/avatar2.jpg",
      rating: 5,
    },
    {
      name: "Michael Brown",
      role: "Engineering Freshman",
      content:
        "From dorm essentials to course materials, campusMart's verified student network helped me settle in quickly while staying within budget.",
      avatar: "/avatar3.jpg",
      rating: 4,
    },
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-7">
            Trusted by Campus Communities
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-300">
            Join thousands of students and faculty members transforming campus commerce
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, role, content, avatar, rating }) {
  return (
    <div className="relative p-8 transition-all duration-300 bg-white shadow-lg rounded-2xl hover:shadow-xl group">
      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-50 group-hover:opacity-100"></div>
      
      <div className="relative flex items-start mb-6">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 -m-0.5">
            <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm"></div>
          </div>
          <img
            src={avatar || "/placeholder-avatar.svg"}
            alt={`${name}'s profile`}
            className="relative z-10 object-cover border-2 border-white rounded-full w-14 h-14"
            loading="lazy"
            onError={(e) => {
              e.target.src = "/placeholder-avatar.svg";
            }}
          />
        </div>
        <div className="ml-5">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm font-medium text-gray-600">{role}</p>
        </div>
      </div>

      <blockquote className="relative mb-6">
        <div className="absolute left-0 font-serif text-6xl text-gray-100 -top-5">“</div>
        <p className="relative z-10 leading-relaxed text-gray-700">
          {content}
        </p>
        <div className="absolute right-0 font-serif text-6xl text-gray-100 -bottom-5">”</div>
      </blockquote>

      <div className="relative flex items-center">
        <div className="flex text-amber-500" role="img" aria-label={`${rating} star rating`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < rating ? "fill-current" : "text-gray-300"}`}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="ml-3 text-sm font-medium text-gray-600">
          {rating}/5 Rating
        </span>
      </div>
    </div>
  );
}