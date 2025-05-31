export type LocationType = {
  latitude: number;
  longitude: number;
};

export type PlaceType = {
  id: string;
  rating: number;
  photos: { name: string }[];
  displayName: { text: string };
  internationalPhoneNumber: string;
  formattedAddress: string;
  googleMapsUri: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type VeterinaryPlaceCardProps = {
  place: PlaceType;
  photoUrls: Record<string, string>;
};
