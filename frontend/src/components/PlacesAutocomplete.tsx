import React, { useState, useEffect, useRef } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { Command } from 'cmdk';
import { Search } from 'lucide-react';

interface PlacesAutocompleteProps {
  onAddressSelect: (position: google.maps.LatLngLiteral) => void;
  placeholder?: string;
  className?: string;
}

export function PlacesAutocomplete({ 
  onAddressSelect,
  placeholder = "Search location...",
  className = ""
}: PlacesAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "lk" }, // Restrict to Sri Lanka
    },
    debounce: 300,
  });

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();
    setOpen(false);

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      onAddressSelect({ lat, lng });
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!ready}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value) {
              setOpen(true);
            } else {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          onFocus={() => status === "OK" && setOpen(true)}
        />
      </div>
      {open && status === "OK" && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          <Command>
            <Command.List>
              {data.map(({ place_id, description }) => (
                <Command.Item 
                  key={place_id} 
                  value={description}
                  onSelect={(value) => handleSelect(value)}
                  className="relative cursor-default select-none py-2 px-3 text-gray-900 hover:bg-blue-100"
                >
                  {description}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
} 