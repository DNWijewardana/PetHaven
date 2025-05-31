import { VeterinaryPlaceCardProps } from "@/types/NearbyVetTypes";
import { MapPin, PhoneCall, Star, StarHalf, Clock, ExternalLink, Heart } from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import petcarePlaceholder from "../assets/images/pet-care-placeholder.webp";
import { useState } from "react";

const VeterinaryPlaceCard = ({
  place,
  photoUrls,
}: VeterinaryPlaceCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Generate random opening hours for demo purposes
  const isOpen = Math.random() > 0.3; // 70% chance of being open
  const openHours = isOpen 
    ? `Open · Closes ${Math.floor(Math.random() * 4) + 6}PM` 
    : `Closed · Opens ${Math.floor(Math.random() * 4) + 7}AM tomorrow`;

  // Generate random services
  const services = [
    "Emergency Care", 
    "Surgery", 
    "Dental Care", 
    "Vaccinations", 
    "Wellness Exams",
    "Grooming",
    "Pet Boarding",
    "Microchipping"
  ];
  
  const randomServices = services
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + 2);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="relative">
        <img
          src={photoUrls[place.id] || petcarePlaceholder}
          alt={place.displayName.text}
          className="w-full h-48 object-cover"
        />
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full text-gray-700 hover:text-rose-500"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
        </Button>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
          <div className="flex items-center space-x-1 text-white">
            <div className="flex items-center">
              {Array.from({ length: Math.floor(place.rating || 0) }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              {place.rating % 1 !== 0 && <StarHalf className="w-4 h-4 fill-amber-400 text-amber-400" />}
            </div>
            <span className="ml-1 text-sm font-medium">{place.rating?.toFixed(1) || "New"}</span>
            {place.userRatingCount && (
              <span className="text-xs opacity-80">({place.userRatingCount})</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-3">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{place.displayName.text}</h2>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{openHours}</span>
          </div>
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-1 text-gray-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-600">{place.formattedAddress}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {randomServices.map((service, index) => (
              <Badge key={index} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {service}
              </Badge>
            ))}
          </div>
          
          {place.internationalPhoneNumber && (
            <div className="flex items-center mb-1">
              <PhoneCall className="h-4 w-4 mr-2 text-indigo-600" />
              <a href={`tel:${place.internationalPhoneNumber}`} className="text-sm text-indigo-600 hover:underline">
                {place.internationalPhoneNumber}
              </a>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          {place.websiteUri ? (
            <a 
              href={place.websiteUri} 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm text-gray-600 hover:text-indigo-600 flex items-center"
            >
              Visit Website
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="text-sm text-gray-400">No website available</span>
          )}
          
          <NavLink
            to={place.googleMapsUri}
            target="_blank"
            rel="noreferrer"
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md flex items-center transition-colors"
          >
            Directions
            <MapPin className="ml-1 h-3.5 w-3.5" />
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default VeterinaryPlaceCard;
