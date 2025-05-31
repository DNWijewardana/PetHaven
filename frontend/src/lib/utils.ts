import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function requestLocationPermission(options?: { 
  showProactivePrompt?: boolean 
}): Promise<GeolocationPosition | null> {
  try {
    // First check if geolocation is supported
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser');
    }

    // Check if permission is already granted
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    
    // If permission is prompt and we want to show proactive prompt
    if (options?.showProactivePrompt && permissionStatus.state === 'prompt') {
      const requestPermission = window.confirm(
        'This feature requires access to your location to work properly.\n\n' +
        'Would you like to allow location access?\n' +
        'You can change this setting at any time in your browser settings.'
      );
      
      if (!requestPermission) {
        return null;
      }
    }
    
    if (permissionStatus.state === 'denied') {
      // If permission is denied, show instructions to enable
      const enableLocation = window.confirm(
        'Location access is required for this feature. Would you like to enable location services?\n\n' +
        'To enable location services:\n' +
        '1. Click OK to open your browser settings\n' +
        '2. Look for "Location" or "Site Settings"\n' +
        '3. Allow location access for this site\n' +
        '4. Refresh the page after enabling'
      );
      
      if (enableLocation) {
        // Open browser settings based on browser type
        if (navigator.userAgent.indexOf('Chrome') !== -1) {
          window.open('chrome://settings/content/location');
        } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
          window.open('about:preferences#privacy');
        } else if (navigator.userAgent.indexOf('Safari') !== -1) {
          window.open('x-apple.systempreferences:com.apple.preference.security?Privacy_LocationServices');
        } else {
          // Generic instructions for other browsers
          alert('Please open your browser settings and enable location access for this site.');
        }
        return null;
      }
      return null;
    }

    // Request location with high accuracy
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          let errorMessage = 'Unable to retrieve your location. ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });

    return position;
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
}

// Helper function to get address from coordinates
export async function getAddressFromCoords(latitude: number, longitude: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
}
