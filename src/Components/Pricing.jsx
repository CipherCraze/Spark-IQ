// components/Pricing.jsx
import { motion } from "framer-motion";
import { 
  SparklesIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/solid';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "0",
      duration: "/month",
      features: [
        "Basic AI Assistance",
        "5 Monthly Credits",
        "Community Support",
        "Standard Resources",
        "Basic Analytics"
      ],
      icon: AcademicCapIcon,
      popular: false
    },
    {
      name: "Pro Learner",
      price: "9",
      duration: "/month",
      features: [
        "Advanced AI Tutor",
        "Unlimited Credits",
        "Priority Support",
        "Premium Resources",
        "Detailed Analytics",
        "Custom Study Plans",
        "Collaboration Tools"
      ],
      icon: RocketLaunchIcon,
      popular: true
    },
    {
      name: "Yearly Saver",
      price: "89",
      duration: "/year",
      features: [
        "All Pro Features",
        "2 Months Free",
        "Dedicated Support",
        "Early Feature Access",
        "Progress Reports",
        "Custom Domains",
        "Team Management"
      ],
      icon: SparklesIcon,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen px-4 py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl"
          >
            <CurrencyDollarIcon className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="mb-4 text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
            Simple, Transparent Pricing
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-300">
            Start learning smarter with AI-powered tools. Upgrade anytime, cancel anytime.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`relative p-8 border rounded-2xl backdrop-blur-lg ${
                plan.popular 
                  ? 'border-indigo-500 bg-gradient-to-b from-indigo-900/30 to-purple-900/30'
                  : 'border-gray-700 bg-gray-800/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-4 py-1 text-sm bg-indigo-500 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <plan.icon className={`w-12 h-12 ${
                  plan.popular ? 'text-indigo-400' : 'text-purple-400'
                }`} />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">{plan.name}</h2>
              <div className="flex items-end mb-6 gap-1.5">
                <span className="text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                  ${plan.price}
                </span>
                <span className="text-gray-400">{plan.duration}</span>
              </div>
              
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full mt-8 py-3 rounded-lg transition-all ${
                plan.popular 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}>
                {plan.name === 'Starter' ? 'Get Started' : 'Choose Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div 
          className="p-8 mt-20 border bg-gray-800/30 backdrop-blur-lg rounded-2xl border-gray-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="mb-8 text-3xl font-bold text-center text-white">Frequently Asked Questions</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                question: "Can I switch plans later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time."
              },
              {
                question: "Do you offer student discounts?",
                answer: "We offer special pricing for educational institutions. Contact our sales team."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards and PayPal."
              },
              {
                question: "Is there a free trial?",
                answer: "The Starter plan is completely free forever. Paid plans come with a 14-day trial."
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 border rounded-xl border-gray-700/50">
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Pricing;