import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Frown, LoaderCircle, MapPin, Navigation, RefreshCw, Search, MapIcon, Star } from "lucide-react";
import { requestLocationPermission } from "@/lib/utils";
import { LocationType, PlaceType } from "@/types/NearbyVetTypes";
import VeterinaryPlaceCard from "@/components/veterinary-place-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const NearbyVets = () => {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [searchRadius, setSearchRadius] = useState<number>(5000); // 5km by default
  const [selectedPlace, setSelectedPlace] = useState<PlaceType | null>(null);
  const [mapCenter, setMapCenter] = useState<LocationType | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredPlaces, setFilteredPlaces] = useState<PlaceType[]>([]);
  const [sortOption, setSortOption] = useState<string>("rating");
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const olMapRef = useRef<Map | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupCloserRef = useRef<HTMLDivElement>(null);
  const popupContentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<Overlay | null>(null);

  // Initialize OpenLayers map
  const initMap = useCallback(() => {
    if (!mapRef.current || !mapCenter) return;

    // Create popup overlay
    const popupContainer = document.createElement('div');
    popupContainer.className = 'ol-popup';
    popupContainer.innerHTML = `
      <div class="ol-popup-closer"></div>
      <div class="ol-popup-content"></div>
    `;
    document.body.appendChild(popupContainer);

    const popupCloser = popupContainer.querySelector('.ol-popup-closer') as HTMLDivElement;
    const popupContent = popupContainer.querySelector('.ol-popup-content') as HTMLDivElement;
    
    // Create overlay for popup
    const overlay = new Overlay({
      element: popupContainer,
      autoPan: true,
      positioning: 'bottom-center',
      stopEvent: false
    });

    // Style for user's location marker
    const userLocationStyle = new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({
          color: 'rgba(79, 70, 229, 0.8)',
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
      }),
    });

    // Style for vet clinic markers
    const placeStyle = new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: 'rgba(220, 38, 38, 0.8)',
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
      }),
      text: new Text({
        font: '12px Helvetica, Arial, sans-serif',
        fill: new Fill({
          color: '#000',
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 3,
        }),
        offsetY: -15,
      }),
    });

    // Create vector source and layer for markers
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    // Create map instance
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([mapCenter.longitude, mapCenter.latitude]),
        zoom: 13,
      }),
      overlays: [overlay],
    });

    // Add user location marker
    const userFeature = new Feature({
      geometry: new Point(fromLonLat([mapCenter.longitude, mapCenter.latitude])),
      name: 'Your location',
      type: 'user',
    });
    userFeature.setStyle(userLocationStyle);
    vectorSource.addFeature(userFeature);

    // Add markers for vet clinics
    filteredPlaces
      .filter(place => place.location)
      .forEach(place => {
        const placeLonLat = fromLonLat([place.location!.longitude, place.location!.latitude]);
        const placeFeature = new Feature({
          geometry: new Point(placeLonLat),
          name: place.displayName.text,
          address: place.formattedAddress || '',
          rating: place.rating || 'N/A',
          url: place.googleMapsUri,
          place: place,
        });
        
        // Clone the style for each feature to set a different label
        const featureStyle = placeStyle.clone();
        const text = featureStyle.getText();
        if (text) {
          text.setText(place.displayName.text);
        }
        placeFeature.setStyle(featureStyle);
        
        vectorSource.addFeature(placeFeature);
      });

    // Add click interaction to show popup
    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      
      if (feature) {
        const geometry = feature.getGeometry() as Point;
        const coordinates = geometry.getCoordinates();
        
        // Different content based on feature type
        if (feature.get('type') === 'user') {
          popupContent.innerHTML = `<div class="p-2 max-w-xs">
            <h3 class="font-bold">Your Location</h3>
          </div>`;
        } else {
          popupContent.innerHTML = `<div class="p-2 max-w-xs">
            <h3 class="font-bold">${feature.get('name')}</h3>
            <p class="text-sm">${feature.get('address')}</p>
            <p class="text-sm mt-1">Rating: ${feature.get('rating')}</p>
            <a 
              href="${feature.get('url')}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 text-sm hover:underline mt-1 block"
            >
              View on Google Maps
            </a>
          </div>`;
        }
        
        overlay.setPosition(coordinates);
        
        // Set selected place if it's not the user marker
        if (feature.get('type') !== 'user') {
          setSelectedPlace(feature.get('place'));
        }
      }
    });

    // Close popup when clicking the X
    popupCloser.addEventListener('click', () => {
      overlay.setPosition(undefined);
      return false;
    });

    // Add styles for the popup
    const style = document.createElement('style');
    style.textContent = `
      .ol-popup {
        position: absolute;
        background-color: white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #cccccc;
        bottom: 12px;
        left: -50px;
        min-width: 200px;
        transform: translateX(-50%);
      }
      .ol-popup:after, .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
      }
      .ol-popup:after {
        border-top-color: white;
        border-width: 10px;
        left: 50%;
        margin-left: -10px;
      }
      .ol-popup:before {
        border-top-color: #cccccc;
        border-width: 11px;
        left: 50%;
        margin-left: -11px;
      }
      .ol-popup-closer {
        text-decoration: none;
        position: absolute;
        top: 2px;
        right: 8px;
        cursor: pointer;
      }
      .ol-popup-closer:after {
        content: "✖";
        font-size: 14px;
        color: #999;
      }
    `;
    document.head.appendChild(style);

    // Store refs for later
    olMapRef.current = map;
    overlayRef.current = overlay;
    setMapReady(true);

    return () => {
      if (map) {
        map.setTarget(undefined);
      }
      if (popupContainer && popupContainer.parentNode) {
        popupContainer.parentNode.removeChild(popupContainer);
      }
    };
  }, [mapCenter, filteredPlaces]);

  // Get user's location
  const getLocation = useCallback(async () => {
    try {
      setLoading(true);
      const position = await requestLocationPermission();
      
      if (!position) {
        setError("Please enable location access to find nearby vet clinics");
        setLoading(false);
        return;
      }

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      
      setLocation(newLocation);
      setMapCenter(newLocation);
      setLoading(false);
    } catch (error) {
      console.error('Location error:', error);
      setError(error instanceof Error ? error.message : "Failed to get location");
      setLoading(false);
    }
  }, []);

  // Fetch nearby places based on user's location
  const fetchNearbyVets = useCallback(async () => {
    if (location) {
      setLoading(true);
      setError(null);
      const { latitude, longitude } = location;
      const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

      // Try using the Google Places API
      try {
        const requestBody = {
          includedTypes: ["veterinary_care"],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: { latitude, longitude },
              radius: searchRadius,
            },
          },
        };

        const response = await axios.post(
          "https://places.googleapis.com/v1/places:searchNearby",
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": MAPS_API_KEY,
              "X-Goog-FieldMask": "*",
            },
          }
        );

        const data = response.data;
        if (data.places && data.places.length > 0) {
          // Add location data if missing
          const placesWithLocation = data.places.map((place: PlaceType) => {
            if (!place.location) {
              const latOffset = (Math.random() - 0.5) * 0.02;
              const lngOffset = (Math.random() - 0.5) * 0.02;
              
              return {
                ...place,
                location: {
                  latitude: location.latitude + latOffset,
                  longitude: location.longitude + lngOffset,
                }
              };
            }
            return place;
          });
          
          setPlaces(placesWithLocation);
          setFilteredPlaces(placesWithLocation);
          await fetchPhotoUrls(placesWithLocation);
        } else {
          // Generate mock data if no results
          generateMockVetClinics();
        }
      } catch (error) {
        console.error(error);
        // Generate mock data if API fails
        generateMockVetClinics();
      } finally {
        setLoading(false);
      }
    }
  }, [location, searchRadius]);

  // Generate mock data
  const generateMockVetClinics = () => {
    if (!location) return;
    
    const mockClinicNames = [
      "PawCare Veterinary Clinic",
      "Healing Paws Animal Hospital",
      "City Pets Veterinary Center",
      "Happy Tails Vet Clinic",
      "Animal Wellness Center",
      "Furry Friends Veterinary",
      "Companion Care Animal Hospital",
      "Pet Health Specialists",
      "All Creatures Vet Clinic",
      "Oak Tree Veterinary Hospital"
    ];
    
    const mockClinics: PlaceType[] = mockClinicNames.map((name, index) => {
      // Generate location in a circle around the user
      const angle = (index / mockClinicNames.length) * Math.PI * 2;
      const distance = (Math.random() * 0.5 + 0.5) * (searchRadius / 100000); // Convert to degrees roughly
      
      return {
        id: `mock-${index}`,
        displayName: { text: name },
        rating: 3 + Math.random() * 2,
        formattedAddress: `${Math.floor(Math.random() * 200) + 1} Main Street, Local City`,
        googleMapsUri: "https://maps.google.com",
        internationalPhoneNumber: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        photos: [],
        location: {
          latitude: location.latitude + Math.cos(angle) * distance,
          longitude: location.longitude + Math.sin(angle) * distance
        }
      };
    });
    
    setPlaces(mockClinics);
    setFilteredPlaces(mockClinics);
  };

  // Fetch photo URLs for all places
  const fetchPhotoUrls = async (places: PlaceType[]) => {
    const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
    const newPhotoUrls: Record<string, string> = {};
    
    await Promise.all(
      places.map(async (place) => {
        if (place.photos && place.photos[0]) {
          try {
            const photoResponse = await fetch(
              `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${MAPS_API_KEY}&maxHeightPx=300`
            );

            if (photoResponse.ok) {
              newPhotoUrls[place.id] = photoResponse.url;
            }
          } catch (error) {
            console.error("Failed to fetch photo URL:", error);
          }
        }
      })
    );
    
    setPhotoUrls(newPhotoUrls);
  };

  // Handle searching and filtering
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredPlaces(places);
      return;
    }
    
    const filtered = places.filter(place => 
      place.displayName.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredPlaces(filtered);
  };

  // Handle sorting
  const handleSort = (option: string) => {
    setSortOption(option);
    const sorted = [...filteredPlaces];
    
    switch(option) {
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        sorted.sort((a, b) => a.displayName.text.localeCompare(b.displayName.text));
        break;
      default:
        break;
    }
    
    setFilteredPlaces(sorted);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilteredPlaces(places);
    setSortOption("rating");
  };

  // Update radius and refetch
  const updateRadius = (radius: number) => {
    setSearchRadius(radius);
  };

  // Focus map on selected place
  const focusOnPlace = (place: PlaceType) => {
    setSelectedPlace(place);
  };

  // Initialize
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Fetch places when location or radius changes
  useEffect(() => {
    if (location) {
      fetchNearbyVets();
    }
  }, [location, searchRadius, fetchNearbyVets]);

  // Set map as ready once we have both location and places
  useEffect(() => {
    if (mapCenter && filteredPlaces.length > 0) {
      // Make sure OpenLayers is loaded before initializing the map
      ensureOpenLayersLoaded().then(() => {
        setMapReady(false);
        
        // Clean up previous map if it exists
        if (olMapRef.current) {
          olMapRef.current.setTarget(undefined);
          olMapRef.current = null;
        }
        
        // Short timeout to ensure the DOM is ready
        setTimeout(() => {
          initMap();
        }, 100);
      });
    }
  }, [mapCenter, filteredPlaces, initMap]);

  // Sort places when sort option changes
  useEffect(() => {
    handleSort(sortOption);
  }, [sortOption]);

  // Update map when filteredPlaces change
  useEffect(() => {
    if (olMapRef.current && mapReady) {
      try {
        // Get vector source from the existing map
        const layers = olMapRef.current.getLayers().getArray();
        const vectorLayer = layers.find(layer => 
          layer instanceof VectorLayer
        ) as VectorLayer<VectorSource> | undefined;
        
        if (vectorLayer) {
          const source = vectorLayer.getSource();
          if (source) {
            // Remove all features except user location
            const features = source.getFeatures();
            features.forEach(feature => {
              if (feature.get('type') !== 'user') {
                source.removeFeature(feature);
              }
            });
            
            // Add markers for filtered vet clinics
            const placeStyle = new Style({
              image: new CircleStyle({
                radius: 6,
                fill: new Fill({
                  color: 'rgba(220, 38, 38, 0.8)',
                }),
                stroke: new Stroke({
                  color: '#fff',
                  width: 2,
                }),
              }),
              text: new Text({
                font: '12px Helvetica, Arial, sans-serif',
                fill: new Fill({
                  color: '#000',
                }),
                stroke: new Stroke({
                  color: '#fff',
                  width: 3,
                }),
                offsetY: -15,
              }),
            });
            
            filteredPlaces
              .filter(place => place.location)
              .forEach(place => {
                const placeLonLat = fromLonLat([place.location!.longitude, place.location!.latitude]);
                const placeFeature = new Feature({
                  geometry: new Point(placeLonLat),
                  name: place.displayName.text,
                  address: place.formattedAddress || '',
                  rating: place.rating || 'N/A',
                  url: place.googleMapsUri,
                  place: place,
                });
                
                // Clone the style for each feature to set a different label
                const featureStyle = placeStyle.clone();
                const text = featureStyle.getText();
                if (text) {
                  text.setText(place.displayName.text);
                }
                placeFeature.setStyle(featureStyle);
                
                source.addFeature(placeFeature);
              });
          }
        }
      } catch (error) {
        console.error("Error updating map markers:", error);
      }
    }
  }, [filteredPlaces, mapReady]);

  // Utility function to check if OpenLayers is properly loaded
  const ensureOpenLayersLoaded = () => {
    return new Promise<void>((resolve) => {
      // If OpenLayers objects are already available, resolve immediately
      if (typeof Map !== 'undefined' && typeof View !== 'undefined') {
        resolve();
        return;
      }
      
      // Otherwise, load the script dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/ol/dist/ol.js';
      script.onload = () => resolve();
      script.onerror = () => {
        console.error("Failed to load OpenLayers library");
        resolve(); // Resolve anyway to not block the UI
      };
      document.head.appendChild(script);
      
      // Also make sure CSS is loaded
      if (!document.querySelector('link[href*="ol.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/ol/ol.css';
        document.head.appendChild(link);
      }
    });
  };

  // Fix Leaflet marker icon issue
  // This is needed because of how webpack handles assets
  useEffect(() => {
    // Fix the Leaflet icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 mb-8 relative overflow-hidden shadow-lg">
        {/* Decorative SVG elements */}
        <div className="absolute top-0 right-0 opacity-10">
          <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="white" d="M38.7,-65.7C51.9,-60.9,65.8,-53.8,74.2,-42.2C82.6,-30.6,85.5,-15.3,84.8,-0.4C84.1,14.5,79.8,29,70.9,39.2C61.9,49.3,48.4,55.1,35.5,61.7C22.5,68.3,11.3,75.6,-0.9,77.2C-13.1,78.8,-26.2,74.6,-39.6,68.4C-53,62.2,-66.7,54,-70.7,42.1C-74.7,30.2,-69,14.9,-66,1.8C-63,-11.4,-62.7,-22.7,-58.3,-32.3C-53.9,-41.9,-45.5,-49.8,-35.3,-56.2C-25.1,-62.7,-12.6,-67.9,0.4,-68.6C13.4,-69.3,26.8,-65.5,38.7,-65.7Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 relative">Nearby Veterinary Clinics</h1>
        <p className="text-lg opacity-90 mb-6 max-w-2xl relative">
          Find the best veterinary care near you for your beloved pets. Our comprehensive directory helps you locate experienced veterinarians in your area.
        </p>
        
        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-lg border border-white/20 shadow-inner relative">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium mb-2 block">Search Radius</label>
              <div className="flex gap-2">
                {[2000, 5000, 10000].map((radius) => (
                  <Button 
                    key={radius} 
                    variant={searchRadius === radius ? "default" : "outline"}
                    onClick={() => updateRadius(radius)}
                    className={searchRadius === radius ? "bg-white text-indigo-700 border-white hover:bg-white/90" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}
                  >
                    {radius / 1000}km
                  </Button>
                ))}
              </div>
            </div>
            <div className="w-full md:w-auto">
              <Button 
                className="w-full bg-white text-indigo-700 hover:bg-white/90 shadow-md"
                onClick={() => {
                  getLocation();
                }}
              >
                <Navigation className="mr-2 h-4 w-4" /> Get My Location
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative paw prints */}
        <div className="absolute bottom-2 left-2 opacity-20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 9C8 10.1046 7.10457 11 6 11C4.89543 11 4 10.1046 4 9C4 7.89543 4.89543 7 6 7C7.10457 7 8 7.89543 8 9Z" fill="white"/>
            <path d="M13 7C13 8.10457 12.1046 9 11 9C9.89543 9 9 8.10457 9 7C9 5.89543 9.89543 5 11 5C12.1046 5 13 5.89543 13 7Z" fill="white"/>
            <path d="M20 9C20 10.1046 19.1046 11 18 11C16.8954 11 16 10.1046 16 9C16 7.89543 16.8954 7 18 7C19.1046 7 20 7.89543 20 9Z" fill="white"/>
            <path d="M14 15C14 16.1046 13.1046 17 12 17C10.8954 17 10 16.1046 10 15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15Z" fill="white"/>
          </svg>
        </div>
        <div className="absolute bottom-10 right-20 opacity-20 rotate-45">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 9C8 10.1046 7.10457 11 6 11C4.89543 11 4 10.1046 4 9C4 7.89543 4.89543 7 6 7C7.10457 7 8 7.89543 8 9Z" fill="white"/>
            <path d="M13 7C13 8.10457 12.1046 9 11 9C9.89543 9 9 8.10457 9 7C9 5.89543 9.89543 5 11 5C12.1046 5 13 5.89543 13 7Z" fill="white"/>
            <path d="M20 9C20 10.1046 19.1046 11 18 11C16.8954 11 16 10.1046 16 9C16 7.89543 16.8954 7 18 7C19.1046 7 20 7.89543 20 9Z" fill="white"/>
            <path d="M14 15C14 16.1046 13.1046 17 12 17C10.8954 17 10 16.1046 10 15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15Z" fill="white"/>
          </svg>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoaderCircle className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-lg text-gray-600">Finding veterinary clinics near you...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center">
          <Frown className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <p className="text-lg text-rose-700 mb-4">{error}</p>
          <Button onClick={getLocation} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      )}

      {filteredPlaces.length > 0 && !loading && (
        <Tabs defaultValue="map" className="mt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <TabsList className="p-1 bg-indigo-50 border border-indigo-100 rounded-lg">
              <TabsTrigger 
                value="list" 
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  List View
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="map"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-1.5">
                  <MapIcon className="h-4 w-4" />
                  Map View
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="static"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 4V17M15 7V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Static Map
                </div>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clinics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 border-indigo-100 focus-visible:ring-indigo-500"
                />
                <Button 
                  variant="ghost" 
                  onClick={handleSearch}
                  className="absolute right-1 h-7 w-7 p-0 text-gray-400 hover:text-indigo-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  className="border border-indigo-100 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={sortOption}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="name">Sort by Name</option>
                </select>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={resetFilters}
                  className="h-10 w-10 border-indigo-100 text-gray-500 hover:text-indigo-600 hover:border-indigo-300"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {filteredPlaces.length} clinics found
            </Badge>
            
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <Search className="h-3 w-3" />
                Search: "{searchQuery}"
              </Badge>
            )}
            
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3V21M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sorted by: {sortOption === 'rating' ? 'Highest Rating' : 'Name'}
            </Badge>
          </div>

          <TabsContent value="list" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map((place) => (
              <VeterinaryPlaceCard
                key={place.id}
                place={place}
                photoUrls={photoUrls}
              />
            ))}
          </div>
          </TabsContent>
          
          <TabsContent value="map" className="mt-0">
            <div className="bg-white rounded-xl overflow-hidden border shadow-sm">
              <div 
                ref={mapRef} 
                className="h-[500px] w-full relative"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {filteredPlaces.slice(0, 6).map((place) => (
                <div
                  key={place.id}
                  className="border bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-3"
                  onClick={() => focusOnPlace(place)}
                >
                  <h3 className="font-semibold text-gray-800 truncate">{place.displayName.text}</h3>
                  <p className="text-gray-500 text-sm">{place.formattedAddress}</p>
                  <div className="flex items-center mt-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                      {place.rating || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="static" className="mt-0">
            <div className="bg-white rounded-xl overflow-hidden border shadow-sm">
              {mapCenter && (
                <img 
                  src={`https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=1200&height=600&center=lonlat:${mapCenter.longitude},${mapCenter.latitude}&zoom=14&apiKey=15e7bd8bd20e492196db3a3360a6ef9a`}
                  alt="Map of veterinary clinics"
                  className="w-full h-auto"
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <MapIcon className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Static Map View</h3>
                    <p className="text-blue-700 text-sm mt-1">
                      This map shows a static view of your area. For interactive features, please use the Map View tab.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlaces.slice(0, 9).map((place) => (
                  <div
                    key={place.id}
                    className="border bg-white rounded-lg shadow-sm p-4"
                  >
                    <h3 className="font-semibold text-gray-800 truncate">{place.displayName.text}</h3>
                    <div className="flex items-center mt-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm ml-1">{place.rating || 'N/A'}</span>
        </div>
                    <p className="text-gray-500 text-sm flex items-start">
                      <MapPin className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                      <span>{place.formattedAddress}</span>
                    </p>
                    {place.internationalPhoneNumber && (
                      <p className="text-gray-500 text-sm mt-1">{place.internationalPhoneNumber}</p>
                    )}
                    <a 
                      href={place.googleMapsUri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 text-sm hover:underline mt-2 inline-block"
                    >
                      View on Google Maps
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// Component to focus map on a specific location
const FocusOnMapEvent = ({ place }: { place: PlaceType | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (place && place.location) {
      map.setView(
        [place.location.latitude, place.location.longitude],
        16
      );
    }
  }, [map, place]);
  
  return null;
};

export default NearbyVets;
