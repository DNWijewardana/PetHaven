import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Sample knowledge base for the chatbot
const knowledgeBase = {
  'lost_pet': [
    "Report a lost pet immediately through our 'Report Lost Pet' feature.",
    "Include clear photos and detailed description of your pet.",
    "Share your contact information so people can reach you.",
    "Check the 'Lost Pets' section regularly for updates."
  ],
  'found_pet': [
    "If you've found a pet, report it through our 'Report Found Pet' feature.",
    "Take clear photos of the pet from multiple angles.",
    "Note the location, date, and time where you found the pet.",
    "Keep the pet safe until the owner is found if possible."
  ],
  'adopt_pet': [
    "Browse pets available for adoption in our 'Assist or Adopt Pets' section.",
    "Contact the pet owner or shelter using the provided information.",
    "Complete the adoption application process.",
    "Prepare your home for your new pet before bringing them home."
  ],
  'vet_clinics': [
    "Find nearby veterinary clinics using our 'Find Vets' feature.",
    "You can filter by distance and read reviews from other pet owners.",
    "Many clinics offer emergency services and specialized care."
  ],
  'pet_health': [
    "Our 'Pet First Aid' guide provides important health information.",
    "Always consult with a veterinarian for serious health concerns.",
    "Regular check-ups are essential for your pet's well-being.",
    "Keep vaccinations up to date for your pet's protection."
  ],
  'donation': [
    "You can donate to support our animal welfare initiatives.",
    "Donations help us reunite lost pets with their owners.",
    "Your contributions support emergency medical care for animals in need.",
    "Visit our 'Donate' page to learn more about how you can help."
  ]
};

// Knowledge base for common pet questions
const petKnowledgeBase = {
  adoption: {
    keywords: ['adopt', 'adoption', 'shelter', 'rescue', 'finding pets', 'get a pet'],
    response: 'For pet adoption, you can browse our Assist or Adopt section to find pets in need of homes. We work with local shelters and rescues to help pets find loving families. You can also use our filters to find pets based on species, age, and other criteria.'
  },
  lostPets: {
    keywords: ['lost pet', 'missing pet', 'find my pet', 'report lost', 'found pet'],
    response: 'If you\'ve lost a pet, you can report it on our Report Lost Pet page. Include a photo, location details, and your contact information. We\'ll help connect you with people who might have found your pet. If you\'ve found a pet, you can report it in our Found Pets section.'
  },
  vetServices: {
    keywords: ['vet', 'veterinarian', 'doctor', 'clinic', 'emergency', 'medical help'],
    response: 'You can find nearby veterinary clinics using our Vet Locator feature. For pet emergencies, check our First Aid Guide for immediate steps to take before reaching a vet. We also have a directory of 24-hour emergency veterinary services.'
  },
  petCare: {
    keywords: ['care', 'food', 'feeding', 'training', 'grooming', 'health', 'vaccinations'],
    response: 'Our Pet Care section provides comprehensive guides on pet nutrition, exercise, grooming, and preventative healthcare. We recommend regular vet check-ups, appropriate vaccinations, and a balanced diet for your pet\'s wellbeing.'
  },
  forum: {
    keywords: ['forum', 'community', 'discussion', 'advice', 'chat', 'talk'],
    response: 'Join our community forum to connect with other pet owners, share experiences, and get advice. You can browse topics from training to health concerns, or start your own discussion thread.'
  },
  default: {
    response: 'I\'m here to help with questions about pet adoption, lost pets, veterinary services, and general pet care. Could you please provide more details about what you\'re looking for?'
  }
};

/**
 * Process the incoming message and return an appropriate response
 * @param {string} message - The message from the user
 * @returns {string} The response message
 */
const processMessage = (message) => {
  const lowerCaseMessage = message.toLowerCase();
  
  // Check for matches in our knowledge base
  for (const category in petKnowledgeBase) {
    if (category === 'default') continue;
    
    const { keywords, response } = petKnowledgeBase[category];
    if (keywords && keywords.some(keyword => lowerCaseMessage.includes(keyword))) {
      return response;
    }
  }
  
  // Default response if no matches
  return petKnowledgeBase.default.response;
};

/**
 * Handle chatbot message requests
 */
export const handleChatMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    throw new ApiError(400, 'Message is required');
  }
  
  const response = processMessage(message);
  
  res.status(200).json({
    success: true,
    response
  });
});

/**
 * Process a message from the chatbot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const processMessageDetailed = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      throw new ApiError(400, 'Message is required');
    }

    // Process the message and generate a response
    const response = generateResponse(message);

    res.status(200).json({
      success: true,
      data: {
        response
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Something went wrong while processing your message'
      });
    }
  }
};

/**
 * Generate a response based on the user's message
 * @param {string} message - The user's message
 * @returns {string} - The generated response
 */
const generateResponse = (message) => {
  const normalizedMessage = message.toLowerCase();
  
  // Check for greetings
  if (containsAny(normalizedMessage, ['hello', 'hi', 'hey', 'greetings'])) {
    return "Hello! I'm PetHaven, your pet care assistant. How can I help you today?";
  }
  
  // Check for thanks
  if (containsAny(normalizedMessage, ['thank', 'thanks', 'appreciate'])) {
    return "You're very welcome! Is there anything else I can help you with?";
  }
  
  // Check for goodbyes
  if (containsAny(normalizedMessage, ['bye', 'goodbye', 'see you', 'farewell'])) {
    return "Goodbye! Feel free to chat again if you have more questions about pet care.";
  }
  
  // Check for specific topics
  let response = '';
  
  if (containsAny(normalizedMessage, ['lost pet', 'missing pet', 'can\'t find my pet'])) {
    response = getRandomResponse(knowledgeBase.lost_pet);
    return `${response} Would you like me to direct you to the 'Report Lost Pet' page?`;
  }
  
  if (containsAny(normalizedMessage, ['found pet', 'found a pet', 'discovered a pet'])) {
    response = getRandomResponse(knowledgeBase.found_pet);
    return response;
  }
  
  if (containsAny(normalizedMessage, ['adopt', 'adoption', 'new pet', 'get a pet'])) {
    response = getRandomResponse(knowledgeBase.adopt_pet);
    return `${response} Would you like to see pets available for adoption?`;
  }
  
  if (containsAny(normalizedMessage, ['vet', 'veterinarian', 'doctor', 'clinic'])) {
    response = getRandomResponse(knowledgeBase.vet_clinics);
    return `${response} Would you like me to help you find veterinary clinics near you?`;
  }
  
  if (containsAny(normalizedMessage, ['health', 'sick', 'injury', 'first aid', 'emergency'])) {
    response = getRandomResponse(knowledgeBase.pet_health);
    return response;
  }
  
  if (containsAny(normalizedMessage, ['donate', 'donation', 'contribute', 'help', 'support'])) {
    response = getRandomResponse(knowledgeBase.donation);
    return response;
  }
  
  // Default response if no specific topics are detected
  return "I'm here to help with pet-related questions. You can ask about lost pets, adoption, veterinary care, pet health, or using any feature of our website!";
};

/**
 * Check if a string contains any of the keywords
 * @param {string} str - The string to check
 * @param {string[]} keywords - An array of keywords to look for
 * @returns {boolean} - True if any keyword is found, false otherwise
 */
const containsAny = (str, keywords) => {
  return keywords.some(keyword => str.includes(keyword));
};

/**
 * Get a random response from an array of possible responses
 * @param {string[]} responses - An array of possible responses
 * @returns {string} - A randomly selected response
 */
const getRandomResponse = (responses) => {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}; 