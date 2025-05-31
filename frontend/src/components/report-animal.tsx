"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Label, TextInput, Textarea, Select } from "flowbite-react";
import { HiLocationMarker } from "react-icons/hi";
import { ImageDropzone } from "./image-dropzone";

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface ReportFormData {
  type: "LOST" | "FOUND" | "INJURED";
  animalType: string;
  description: string;
  location: Location | null;
  images: File[];
  contactInfo: string;
}

export function ReportAnimal() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ReportFormData>({
    type: "LOST",
    animalType: "",
    description: "",
    location: null,
    images: [],
    contactInfo: "",
  });

  const getUserLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get address using reverse geocoding (you'll need to implement this)
        // const address = await reverseGeocode(latitude, longitude);
        
        setUserLocation({
          latitude,
          longitude,
          // address,
        });
        
        setFormData(prev => ({
          ...prev,
          location: {
            latitude,
            longitude,
            // address,
          }
        }));
        
        setIsLoading(false);
      },
      (error) => {
        setError("Unable to retrieve your location");
        setIsLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      // Handle success (e.g., show success message, redirect)
      
    } catch (error) {
      setError("Failed to submit report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Report an Animal
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Report Type</Label>
            <Select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ReportFormData["type"] }))}
              required
            >
              <option value="LOST">Lost Animal</option>
              <option value="FOUND">Found Animal</option>
              <option value="INJURED">Injured Animal</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="animalType">Animal Type</Label>
            <TextInput
              id="animalType"
              type="text"
              placeholder="e.g., Dog, Cat, Bird"
              value={formData.animalType}
              onChange={(e) => setFormData(prev => ({ ...prev, animalType: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about the animal and situation..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
            />
          </div>

          <div>
            <Label>Location</Label>
            <Button
              color={userLocation ? "success" : "primary"}
              onClick={getUserLocation}
              disabled={isLoading}
              className="w-full"
            >
              <HiLocationMarker className="mr-2 h-5 w-5" />
              {userLocation ? "Location Captured" : "Get Current Location"}
            </Button>
            {userLocation && (
              <p className="mt-2 text-sm text-gray-600">
                Lat: {userLocation.latitude.toFixed(6)}, Long: {userLocation.longitude.toFixed(6)}
              </p>
            )}
          </div>

          <div>
            <Label>Images</Label>
            <ImageDropzone
              onImagesSelected={(files) => setFormData(prev => ({ ...prev, images: files }))}
            />
          </div>

          <div>
            <Label htmlFor="contactInfo">Contact Information</Label>
            <TextInput
              id="contactInfo"
              type="text"
              placeholder="Phone number or email"
              value={formData.contactInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !userLocation}
            className="w-full"
          >
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Card>
    </div>
  );
} 