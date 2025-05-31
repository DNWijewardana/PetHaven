import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  Search, 
  HeartPulse, 
  Droplets, 
  Wind, 
  Pill, 
  PawPrint,
  Thermometer,
  Activity,
  Eye,
  Scissors
} from "lucide-react";

const PET_HEALTH_GUIDES = [
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
    videoUrl: "https://www.youtube.com/embed/3JHdrojxzSw",
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
    id: "pet-cpr",
    title: "Pet CPR and Rescue Breathing",
    category: "emergency",
    content: "In critical situations, knowing how to perform CPR on your pet could save their life while rushing to emergency veterinary care.",
    steps: [
      "Check responsiveness and breathing",
      "If not breathing, give 2 rescue breaths (close mouth and breathe into nostrils)",
      "Check for pulse (inner thigh, where leg meets body)",
      "If no pulse, begin chest compressions",
      "For small dogs/cats: compress chest with thumb and fingers from both sides of chest",
      "For larger dogs: place hands over widest part of chest and compress",
      "Perform 30 compressions followed by 2 rescue breaths",
      "Continue until you reach veterinary care"
    ],
    videoUrl: "https://www.youtube.com/embed/3JHdrojxzSw",
    symptoms: ["Unconsciousness", "Not breathing", "No detectable pulse", "Blue or pale gums"],
    whenToSeeVet: ["IMMEDIATELY - CPR is only a temporary measure until professional veterinary care can be provided"]
  },
  {
    id: "tick-fever",
    title: "Tick Fever",
    category: "diseases",
    content: "Tick fever is common in Sri Lanka and can cause serious illness in dogs if not treated promptly.",
    steps: [
      "Remove any visible ticks using a tick removal tool or tweezers (grab close to skin and pull steadily)",
      "Save the tick in a sealed container for identification",
      "Clean the bite area with antiseptic",
      "Monitor your pet for symptoms of tick-borne diseases",
      "Keep your pet calm and comfortable",
      "Administer medication as prescribed by your veterinarian"
    ],
    videoUrl: "https://www.youtube.com/embed/foSHYbQKlxg",
    symptoms: ["Fever", "Lethargy", "Decreased appetite", "Enlarged lymph nodes", "Joint pain", "Pale gums"],
    whenToSeeVet: ["Any suspected tick-borne disease requires veterinary attention", "Weakness or collapse", "Difficulty breathing", "Bleeding disorders (nosebleeds, blood in urine)"]
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
  },
  {
    id: "poisoning",
    title: "Poisoning",
    category: "emergency",
    content: "If you suspect your pet has ingested something toxic, quick action is essential.",
    steps: [
      "Identify the poison if possible and secure the container/substance",
      "Do NOT induce vomiting unless directed by a veterinarian",
      "Remove any remaining poison from fur/skin with mild soap and water if it's safe to do so",
      "If poison is on the paws, prevent your pet from licking them",
      "Call your vet immediately with information about the substance and when it was ingested"
    ],
    videoUrl: "https://www.youtube.com/embed/LBHLWp0wRmQ",
    symptoms: ["Vomiting or diarrhea", "Drooling", "Lethargy", "Lack of coordination", "Seizures", "Difficulty breathing", "Pale or yellow gums"],
    whenToSeeVet: ["ALL suspected poisoning cases require immediate veterinary attention"]
  },
  {
    id: "broken-bones",
    title: "Fractures and Broken Bones",
    category: "injuries",
    content: "Fractures are painful and require careful handling to prevent further injury.",
    steps: [
      "Keep your pet calm and minimize movement",
      "Do not attempt to reset or straighten the bone",
      "For small pets, place them in a secure carrier with padding",
      "For larger pets, use a rigid surface (board) as a stretcher if needed",
      "Only apply a splint if you're trained to do so and veterinary care will be delayed",
      "Cover any open wounds with clean gauze"
    ],
    videoUrl: "https://www.youtube.com/embed/YXrW_BLeSF0",
    symptoms: ["Limping or inability to bear weight", "Swelling", "Visible deformity", "Pain when touched", "Refusal to move"],
    whenToSeeVet: ["All suspected fractures require veterinary attention"]
  },
  {
    id: "eye-injuries",
    title: "Eye Injuries",
    category: "injuries",
    content: "Eye injuries require special care as they can rapidly worsen and potentially lead to vision loss.",
    steps: [
      "Prevent your pet from rubbing the eye with an Elizabethan collar if available",
      "For chemical exposure, flush the eye with room temperature clean water or saline solution for 10-15 minutes",
      "Do not remove any object embedded in the eye",
      "Cover the eye with a moist clean cloth for protection during transport to the vet"
    ],
    videoUrl: "https://www.youtube.com/embed/o9rss-6LRGE",
    symptoms: ["Excessive tearing", "Squinting", "Redness", "Cloudiness", "Visible trauma", "Pawing at the eye", "Swelling"],
    whenToSeeVet: ["ALL eye injuries require prompt veterinary attention"]
  }
];

export default function PetFirstAid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredGuides = PET_HEALTH_GUIDES.filter((guide) => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           guide.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Pet First Aid & Medical Guide</h1>
        <p className="text-lg text-gray-600 mb-6">
          Learn how to handle pet emergencies and provide proper care for common health issues
        </p>
      </div>

      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-semibold text-amber-800">Important Disclaimer</h2>
            <p className="mt-2 text-amber-700">
              This information is not a substitute for professional veterinary care. Always contact a veterinarian as 
              soon as possible in emergency situations. These guides are meant to help you provide initial care 
              until professional help can be reached.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search for conditions or symptoms..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex-shrink-0">
          <Tabs 
            value={selectedCategory} 
            onValueChange={setSelectedCategory} 
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="injuries">Injuries</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="diseases">Diseases</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {filteredGuides.map((guide) => (
          <Card key={guide.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {guide.category === "emergency" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                {guide.category === "injuries" && <Scissors className="h-5 w-5 text-orange-500" />}
                {guide.category === "conditions" && <Thermometer className="h-5 w-5 text-blue-500" />}
                {guide.category === "diseases" && <Activity className="h-5 w-5 text-purple-500" />}
                {guide.title}
              </CardTitle>
              <CardDescription>
                {guide.content}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => document.getElementById(guide.id)?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Guide
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No guides found matching your search criteria.</p>
          <Button 
            variant="ghost" 
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}

      <Separator className="my-10" />
      
      <div className="space-y-16">
        {PET_HEALTH_GUIDES.map((guide) => (
          <div 
            key={guide.id} 
            id={guide.id} 
            className="scroll-mt-20"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
              {guide.category === "emergency" && <AlertTriangle className="h-6 w-6 text-red-500" />}
              {guide.category === "injuries" && <Scissors className="h-6 w-6 text-orange-500" />}
              {guide.category === "conditions" && <Thermometer className="h-6 w-6 text-blue-500" />}
              {guide.category === "diseases" && <Activity className="h-6 w-6 text-purple-500" />}
              {guide.title}
              {guide.category === "emergency" && (
                <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                  Emergency
                </span>
              )}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <p className="text-lg">{guide.content}</p>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Signs & Symptoms</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {guide.symptoms.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">First Aid Steps</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    {guide.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">When to See a Vet</h3>
                  <ul className="list-disc pl-5 space-y-1 text-rose-800">
                    {guide.whenToSeeVet.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <div className="aspect-video">
                  <iframe 
                    className="w-full h-full rounded-lg shadow-md"
                    src={guide.videoUrl}
                    title={`${guide.title} First Aid Video`}
                    frameBorder="0"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{ border: 'none' }}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-10" />

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Essential Pet First Aid Kit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bandaging Supplies</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                <li>Gauze pads and rolls</li>
                <li>Adhesive medical tape</li>
                <li>Non-stick bandages</li>
                <li>Elastic bandage wraps</li>
                <li>Cotton balls/swabs</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tools & Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                <li>Blunt-end scissors</li>
                <li>Tweezers</li>
                <li>Digital thermometer</li>
                <li>Tick removal tool</li>
                <li>Small flashlight</li>
                <li>Muzzle or makeshift muzzle material</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medications & Liquids</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                <li>Saline solution (wound cleaning)</li>
                <li>Antiseptic solution (vet-approved)</li>
                <li>Hydrogen peroxide 3% (only use when directed by vet)</li>
                <li>Styptic powder (for nail bleeding)</li>
                <li>Antibiotic ointment (vet-approved)</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transport & Restraint</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                <li>Pet carrier or basket</li>
                <li>Blanket or towel</li>
                <li>Leash and collar/harness</li>
                <li>Stretcher (can be makeshift with rigid board)</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                <li>Veterinarian contact info</li>
                <li>Emergency vet hospital location and number</li>
                <li>Pet's medical records</li>
                <li>Pet poison helpline number</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-10 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Find Veterinary Help Nearby</h2>
        <p className="mb-4">In case of emergency, locate the nearest veterinary clinic or hospital quickly.</p>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/vet-locator'}>
          Find a Vet Near Me
        </Button>
      </div>
    </div>
  );
} 