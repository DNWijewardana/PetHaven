import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { API_ENDPOINTS } from "./lib/constants";
import { Link } from "react-router-dom";
import { 
  PawPrint, 
  MapPin, 
  Heart, 
  Search, 
  ShoppingBag, 
  MessageCircle, 
  HandHeart, 
  HelpCircle, 
  Shield, 
  HeartPulse,
  DollarSign,
  MoveRight,
  Star,
  Dog,
  Cat,
  Bird
} from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";

// Define TypeScript interfaces for component props
interface NavigationTileProps {
  to: string;
  icon: ReactNode;
  title: string;
  color: string;
}

interface SecondaryTileProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
}

interface StatCardProps {
  number: string;
  label: string;
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  location: string;
}

interface ActionButton {
  text: string;
  to: string;
  primary: boolean;
  icon: ReactNode;
}

function App() {
  const { user, isAuthenticated } = useAuth0();
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([
    { text: "Report a Lost Pet", to: "/report-lost-pet", primary: true, icon: <PawPrint className="h-5 w-5 mr-2" /> },
    { text: "Find Lost Pets", to: "/lost-pets", primary: false, icon: <Search className="h-5 w-5 mr-2" /> }
  ]);

  // User info save to database
  useEffect(() => {
    if (isAuthenticated && user) {
      axios
        .post(`${API_ENDPOINTS.USERS}/register`, {
          name: user.name,
          email: user.email,
          picture: user.picture,
          sub: user.sub,
          isAdmin: user["https://pethaven.com/roles"]?.includes("admin")
        })
        .then((response) => {
          console.log(response.data.message);
        })
        .catch((error) => {
          // Log the error but don't let it crash the app
          console.error("User registration error:", error);
          // We can still continue without registration if it fails
        });
    }
  }, [isAuthenticated, user]);

  // Change buttons randomly every 8 seconds
  useEffect(() => {
    const buttonOptions: ActionButton[] = [
      { text: "Report a Lost Pet", to: "/report-lost-pet", primary: true, icon: <PawPrint className="h-5 w-5 mr-2" /> },
      { text: "Find Lost Pets", to: "/lost-pets", primary: false, icon: <Search className="h-5 w-5 mr-2" /> },
      { text: "Adopt a Pet", to: "/assist-or-adopt-pets", primary: true, icon: <Heart className="h-5 w-5 mr-2" /> },
      { text: "Find a Vet", to: "/nearby-vets", primary: false, icon: <MapPin className="h-5 w-5 mr-2" /> },
      { text: "Pet First Aid", to: "/pet-first-aid", primary: true, icon: <HeartPulse className="h-5 w-5 mr-2" /> },
      { text: "Support Us", to: "/donate", primary: false, icon: <DollarSign className="h-5 w-5 mr-2" /> }
    ];

    const interval = setInterval(() => {
      // Get two random unique buttons
      const shuffled = [...buttonOptions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 2);
      // Ensure one primary and one secondary button
      selected[0].primary = true;
      selected[1].primary = false;
      setActionButtons(selected);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero Section with animated elements */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        {/* Animated pet silhouettes */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <motion.div 
            className="absolute text-indigo-600"
            initial={{ x: -100, y: 100 }}
            animate={{ x: window.innerWidth + 100, y: 300 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <Dog size={80} />
          </motion.div>
          <motion.div 
            className="absolute text-pink-600"
            initial={{ x: window.innerWidth + 100, y: 200 }}
            animate={{ x: -100, y: 400 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <Cat size={70} />
          </motion.div>
          <motion.div 
            className="absolute text-amber-600"
            initial={{ x: window.innerWidth / 2, y: -50 }}
            animate={{ x: window.innerWidth / 3, y: window.innerHeight + 50 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Bird size={60} />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="relative z-10 py-20 md:py-28 lg:py-36">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pet Haven
                </h1>
                <p className="text-2xl md:text-3xl font-medium text-gray-800 mb-3">
                  Where Every Pet Finds Love
                </p>
              </motion.div>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Connecting pets with loving homes, reuniting lost companions, and supporting pet owners across Sri Lanka
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-5 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                {actionButtons.map((button, index) => (
                  <Link 
                    key={index}
                    to={button.to} 
                    className={`
                      flex items-center px-6 py-3.5 rounded-xl font-medium text-base 
                      shadow-lg transition-all duration-300 
                      ${button.primary 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white' 
                        : 'bg-white text-indigo-700 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'}
                    `}
                  >
                    {button.icon}
                    {button.text}
                    {button.primary && <MoveRight className="ml-2 h-5 w-5" />}
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tiles */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Featured Section */}
        <div className="mb-20">
          <motion.div 
            className="border-l-4 border-l-indigo-500 pl-4 mb-10"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Quick Access
            </h2>
            <p className="text-gray-600 mt-2">
              Find what you need with our easy navigation tiles
            </p>
          </motion.div>

          {/* Navigation Tiles - Main Features */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            <NavigationTile 
              to="/lost-pets"
              icon={<Search className="h-8 w-8" />}
              title="Find Lost Pets"
              color="bg-gradient-to-br from-red-500 to-pink-600"
            />
            <NavigationTile 
              to="/report-lost-pet"
              icon={<PawPrint className="h-8 w-8" />}
              title="Report Lost Pet"
              color="bg-gradient-to-br from-orange-500 to-amber-600"
            />
            <NavigationTile 
              to="/assist-or-adopt-pets"
              icon={<Heart className="h-8 w-8" />}
              title="Adopt a Pet"
              color="bg-gradient-to-br from-purple-500 to-violet-600"
            />
            <NavigationTile 
              to="/nearby-vets"
              icon={<MapPin className="h-8 w-8" />}
              title="Find Vets"
              color="bg-gradient-to-br from-blue-500 to-cyan-600"
            />
            <NavigationTile 
              to="/pet-first-aid"
              icon={<HeartPulse className="h-8 w-8" />}
              title="Pet First Aid"
              color="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <NavigationTile 
              to="/shop"
              icon={<ShoppingBag className="h-8 w-8" />}
              title="Pet Shop"
              color="bg-gradient-to-br from-green-500 to-emerald-600"
            />
            <NavigationTile 
              to="/community"
              icon={<MessageCircle className="h-8 w-8" />}
              title="Community"
              color="bg-gradient-to-br from-teal-500 to-cyan-600"
            />
            <NavigationTile 
              to="/donate"
              icon={<DollarSign className="h-8 w-8" />}
              title="Donate"
              color="bg-gradient-to-br from-indigo-500 to-blue-600"
            />
          </div>
        </div>

        {/* Secondary Features Section */}
        <div className="mb-20">
          <motion.div 
            className="border-l-4 border-l-indigo-500 pl-4 mb-10"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Additional Services
            </h2>
            <p className="text-gray-600 mt-2">
              Explore more ways we can help you and your pets
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SecondaryTile 
              to="/my-verifications"
              icon={<Shield className="h-6 w-6 text-indigo-600" />}
              title="Pet Verifications"
              description="Verify your pet ownership claims and help reunite lost pets with their rightful owners."
            />
            <SecondaryTile 
              to="/faq"
              icon={<HelpCircle className="h-6 w-6 text-indigo-600" />}
              title="FAQ & Help Center"
              description="Find answers to common questions about pet care, adoption, and our services."
            />
            <SecondaryTile 
              to="/volunteer"
              icon={<HandHeart className="h-6 w-6 text-indigo-600" />}
              title="Volunteer"
              description="Join our network of volunteers helping reunite pets with their families."
            />
          </div>
        </div>

        {/* Stats Section */}
        <motion.div 
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-10 mb-20 shadow-xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Our Impact</h2>
            <p className="text-gray-600 mt-2">Together we're making a difference for pets across Sri Lanka</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StatCard number="1000+" label="Pets Adopted" />
            <StatCard number="500+" label="Pets Reunited" />
            <StatCard number="250+" label="Vet Clinics" />
            <StatCard number="5000+" label="Active Users" />
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <div className="mb-16">
          <motion.div 
            className="border-l-4 border-l-indigo-500 pl-4 mb-10"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Success Stories
            </h2>
            <p className="text-gray-600 mt-2">
              Hear from pet owners who found help through our platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="Thanks to Pet Haven, I was reunited with my lost dog Max within 24 hours! The community here is amazing."
              author="Priya M."
              location="Colombo"
            />
            <TestimonialCard 
              quote="The pet first aid guide saved my cat's life when she was choking. I'm forever grateful for this resource!"
              author="Amal J."
              location="Kandy"
            />
            <TestimonialCard 
              quote="I found the perfect companion through the adoption section. The process was smooth and now Luna is part of our family."
              author="Dinesh T."
              location="Galle"
            />
          </div>
        </div>
      </main>
    </>
  );
}

function NavigationTile({ to, icon, title, color }: NavigationTileProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link 
        to={to} 
        className={`${color} text-white rounded-2xl p-5 flex flex-col items-center justify-center text-center h-36 shadow-xl`}
      >
        <div className="bg-white/20 p-3 rounded-full mb-3">
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </Link>
    </motion.div>
  );
}

function SecondaryTile({ to, icon, title, description }: SecondaryTileProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link 
        to={to} 
        className="block bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all h-full"
      >
        <div className="bg-indigo-100 p-3 rounded-full inline-block mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-xl mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </Link>
    </motion.div>
  );
}

function StatCard({ number, label }: StatCardProps) {
  return (
    <motion.div 
      className="bg-white p-6 rounded-2xl shadow-lg"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="font-bold text-4xl mb-2 text-indigo-600">{number}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </motion.div>
  );
}

function TestimonialCard({ quote, author, location }: TestimonialCardProps) {
  return (
    <motion.div 
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-amber-500 mb-4">
        <Star className="h-6 w-6 inline-block" fill="currentColor" />
        <Star className="h-6 w-6 inline-block" fill="currentColor" />
        <Star className="h-6 w-6 inline-block" fill="currentColor" />
        <Star className="h-6 w-6 inline-block" fill="currentColor" />
        <Star className="h-6 w-6 inline-block" fill="currentColor" />
      </div>
      <p className="text-gray-700 mb-4 italic">"{quote}"</p>
      <div className="font-semibold text-gray-900">{author}</div>
      <div className="text-gray-500 text-sm">{location}</div>
    </motion.div>
  );
}

export default App;
