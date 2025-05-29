import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// Sample data for medical guides
const MEDICAL_GUIDES = [
  {
    id: "cuts-wounds",
    title: "Cuts and Wounds",
    category: "injuries",
    content: "When your pet has a cut or wound, it's important to clean and care for it properly to prevent infection.",
    steps: [
      "Gently clean the wound with warm water or saline solution",
      "Remove any debris if possible, using tweezers if necessary",
      "Apply gentle pressure with a clean cloth if bleeding",
      "Apply an appropriate pet-safe antiseptic",
      "Cover with a bandage if needed and prevent your pet from licking it",
      "Seek veterinary care for deep cuts, puncture wounds, or if signs of infection develop"
    ],
    videoUrl: "https://www.youtube.com/embed/1d4Fm3zXsKA",
    symptoms: ["Bleeding", "Swelling", "Redness", "Pain when touched", "Limping (if on a limb)"],
    whenToSeeVet: ["Deep wounds", "Puncture wounds", "Excessive bleeding", "Signs of infection (increased redness, swelling, discharge)", "Wounds on the face, eyes, or genitals"]
  },
  {
    id: "dehydration",
    title: "Dehydration",
    category: "conditions",
    content: "Dehydration occurs when your pet loses more fluids than they take in and can be life-threatening if severe.",
    steps: [
      "Offer fresh, clean water in multiple locations",
      "For mild cases, encourage drinking by adding flavor to water (like low-sodium chicken broth for dogs)",
      "For pets refusing to drink, try offering ice cubes to lick",
      "Check for signs of improvement such as increased energy and skin elasticity",
      "Monitor urine output - it should return to normal color and volume"
    ],
    videoUrl: "https://www.youtube.com/embed/pIHYkeUJgHY",
    symptoms: ["Dry gums", "Loss of skin elasticity (skin tent test)", "Sunken eyes", "Lethargy", "Decreased appetite", "Thick saliva"],
    whenToSeeVet: ["Severe lethargy", "Complete refusal to drink", "Vomiting and unable to keep water down", "Diarrhea with dehydration", "Symptoms persist for more than 24 hours"]
  },
  {
    id: "heat-stroke",
    title: "Heat Stroke",
    category: "emergency",
    content: "Heat stroke is a very serious condition that can quickly become life-threatening, especially in Sri Lanka's hot climate.",
    steps: [
      "Move your pet to a cool, shaded area immediately",
      "Apply cool (not cold) water to their body, especially the neck, armpits, and groin",
      "Place wet, cool towels over the body",
      "Direct a fan at your wet pet to enhance cooling",
      "Offer small amounts of cool water to drink if conscious",
      "Monitor their temperature if possible (normal dog temp is 38-39°C)"
    ],
    videoUrl: "https://www.youtube.com/embed/vS_j77H9yzU",
    symptoms: ["Heavy panting", "Bright red gums", "Drooling", "Rapid heartbeat", "Lethargy or weakness", "Vomiting", "Collapse or seizures"],
    whenToSeeVet: ["ALL heat stroke cases require immediate veterinary attention, even if your pet seems to recover"]
  }
];

// Get all medical guides
export const getAllMedicalGuides = asyncHandler(async (req, res) => {
  // In a real implementation, this would fetch from a database
  res.status(200).json({
    success: true,
    count: MEDICAL_GUIDES.length,
    data: MEDICAL_GUIDES
  });
});

// Get medical guide by ID
export const getMedicalGuideById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find the guide by ID
  const guide = MEDICAL_GUIDES.find(guide => guide.id === id);
  
  if (!guide) {
    throw new ApiError(404, 'Medical guide not found');
  }
  
  res.status(200).json({
    success: true,
    data: guide
  });
});

// Get medical guides by category
export const getMedicalGuidesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  // Filter guides by category
  const guides = MEDICAL_GUIDES.filter(guide => guide.category === category);
  
  res.status(200).json({
    success: true,
    count: guides.length,
    data: guides
  });
});

// Search medical guides
export const searchMedicalGuides = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(200).json({
      success: true,
      count: MEDICAL_GUIDES.length,
      data: MEDICAL_GUIDES
    });
  }
  
  // Search in title and content
  const guides = MEDICAL_GUIDES.filter(guide => 
    guide.title.toLowerCase().includes(query.toLowerCase()) || 
    guide.content.toLowerCase().includes(query.toLowerCase())
  );
  
  res.status(200).json({
    success: true,
    count: guides.length,
    data: guides
  });
}); 