import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router"; // Import Link from react-router-dom

export default function Footer() {
  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-12 text-white bg-gray-800">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Campus Mart</h3>
            <p className="text-sm text-gray-400">
              Your trusted marketplace for campus communities.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick Links">
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { name: "About Us", path: "/about" },
                { name: "How It Works", path: "/how-it-works" },
                { name: "FAQs", path: "/support" },
                { name: "Contact Us", path: "/support" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="transition-colors hover:text-white"
                    aria-label={link.name}
                    onClick={scrollToTop} // Scroll to top on click
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal Section */}
          <nav aria-label="Legal">
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { name: "Terms of Service", path: "#" },
                { name: "Privacy Policy", path: "#" },
                { name: "Cookie Policy", path: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.path}
                    className="transition-colors hover:text-white"
                    aria-label={link.name}
                    onClick={scrollToTop} // Scroll to top on click
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Media */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Connect With Us</h3>
            <div className="flex space-x-4">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="text-gray-400 transition-colors hover:text-white"
                  aria-label={`Follow us on ${label}`}
                  onClick={scrollToTop} // Scroll to top on click
                >
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 mt-8 text-sm text-center text-gray-400 border-t border-gray-700">
          <p>
            © {new Date().getFullYear()} campusMart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}