import AboutCard from "@/components/about-card";
import PageHeading from "@/components/page-heading";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";

const About = () => {
  const teamData = [
    {
      name: "Dimalka Navod",
      role: "Full Stack Engineer",
      image: "https://i.postimg.cc/Lsb2xHtX/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      name: "Ruwantha Bandara",
      role: "Software Engineer",
      image: "https://i.postimg.cc/Lsb2xHtX/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      name: "Tilan Dinuka",
      role: "Full Stack Engineer",
      image: "https://i.postimg.cc/Lsb2xHtX/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      name: "Dulshan Achalanka",
      role: "UI/UX Designer",
      image: "https://i.postimg.cc/Lsb2xHtX/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      name: "Janindu Indeepa",
      role: "Front-End Developer",
      image: "https://i.postimg.cc/Lsb2xHtX/default-avatar-icon-of-social-media-user-vector.jpg",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-18.3rem)] bg-gradient-to-b from-white to-rose-50 dark:from-gray-900 dark:to-gray-950">
      {/* Hero section */}
      <div className="relative">
        <div className="absolute inset-0 bg-rose-600/10 dark:bg-rose-800/20 backdrop-blur-sm -z-10 h-60"></div>
        <PageHeading pageName="About PetHaven" />
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Our Mission</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            We are a team of passionate individuals dedicated to creating a
            platform that connects pet owners with the resources they need to
            care for their furry friends. Our mission is to make pet care easier
            and more accessible for everyone.
          </p>
        </div>
      </div>

      {/* Team section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 justify-items-center">
            {teamData.map((member, index) => (
              <AboutCard
                key={index}
                name={member.name}
                role={member.role}
                image={member.image}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contact section */}
      <div className="py-16 px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Get In Touch
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-rose-500" />
                  <span className="text-gray-700 dark:text-gray-300">contact@pethaven.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-rose-500" />
                  <span className="text-gray-700 dark:text-gray-300">+94 76 372 1373</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-rose-500 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300">
                    No. 123, 1st Floor, Main Street, Colombo, Sri Lanka
                  </span>
                </div>
              </div>
              <div className="flex mt-6 space-x-4">
                <a href="#" className="text-gray-500 hover:text-rose-500 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-rose-500 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-rose-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Business Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monday - Friday</span>
                  <span className="font-medium text-gray-800 dark:text-white">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Saturday</span>
                  <span className="font-medium text-gray-800 dark:text-white">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sunday</span>
                  <span className="font-medium text-gray-800 dark:text-white">Closed</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  Need urgent help? Our pet emergency hotline is available 24/7.
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-rose-600" />
                  <span className="font-semibold text-rose-600">+94 76 372 1374</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
