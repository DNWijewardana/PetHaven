import { useState } from "react";
import PageHeading from "@/components/page-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = {
    general: [
      {
        question: "What is PawHaven?",
        answer: "PawHaven is a comprehensive platform dedicated to pet welfare. We connect pet owners, rescuers, and animal lovers to help lost pets find their way home, assist injured animals, facilitate adoptions, and provide access to veterinary care and pet supplies."
      },
      {
        question: "How do I create an account?",
        answer: "Click on the Sign Up button in the top navigation bar. You can register using your email address or use your Google account for a quicker sign-up process."
      },
      {
        question: "Is the service free to use?",
        answer: "Yes, most of our core services are free, including reporting lost pets, listing pets for adoption, and accessing pet care information. Some premium features or marketplace transactions may involve fees."
      },
      {
        question: "How can I contact support?",
        answer: "Visit our Contact page to send us a message, or email us directly at support@pawhaven.com. We typically respond within 24-48 hours."
      },
      {
        question: "Can I use the platform on mobile devices?",
        answer: "Yes, our website is fully responsive and works on smartphones, tablets, and desktop computers."
      }
    ],
    lostPets: [
      {
        question: "What should I do if I find an injured pet?",
        answer: "If you find an injured pet, approach calmly, check for visible injuries, and contact a local vet or animal rescue service for immediate assistance. You can also report the injured pet on our platform."
      },
      {
        question: "How can I help a stray pet in need?",
        answer: "Provide food, water, and shelter if possible. Post about the pet on our platform or local community boards to find assistance."
      },
      {
        question: "How can I report a lost pet?",
        answer: "Click on the 'Report Lost Pet' button on our homepage or navigate to the Lost Pets section. Fill out the form with details about your pet, including photos, location last seen, and your contact information."
      },
      {
        question: "How can I find a lost pet's owner?",
        answer: "Check for identification tags, take the pet to a vet to scan for a microchip, and post in our 'Found Pets' section. You can also share the listing on social media for greater visibility."
      },
      {
        question: "How do I update my lost pet listing if my pet is found?",
        answer: "Log in to your account, go to 'My Profile', find your lost pet listing, and mark it as 'Resolved'. This helps keep our database current."
      }
    ],
    adoption: [
      {
        question: "How do I list a pet for adoption?",
        answer: "Navigate to 'List for Adopt' in the main menu. Fill out the form with details about the pet, including photos, temperament, and any special needs."
      },
      {
        question: "How can I adopt a pet from the platform?",
        answer: "Browse the 'Assist or Adopt Pets' section to view available pets. When you find a pet you're interested in, click the 'Contact' button to get in touch with the current caretaker."
      },
      {
        question: "Is there a fee for adoption?",
        answer: "Adoption fees, if any, are set by the individual or organization listing the pet. Many rescue organizations charge a nominal fee to cover vaccinations and care costs."
      },
      {
        question: "Can I adopt a pet if I live in a different city?",
        answer: "This depends on the individual or organization listing the pet. Some may be willing to arrange transportation, while others prefer local adoptions to ensure home visits can be conducted."
      },
      {
        question: "Are the pets on your platform vaccinated and neutered/spayed?",
        answer: "The health status of each pet varies and should be listed in their profile. Always ask the current caretaker about vaccinations, spaying/neutering, and any medical history."
      }
    ],
    vetServices: [
      {
        question: "How can I find a veterinarian near me?",
        answer: "Use our 'Vet Locator' feature to find veterinary clinics near your location. You can filter by services offered and read reviews from other pet owners."
      },
      {
        question: "What should I do in a pet medical emergency?",
        answer: "For emergencies, contact the nearest emergency veterinary clinic immediately. Our 'Vet Locator' can help you find 24-hour emergency services. Also, check our 'Pet First Aid' page for immediate steps you can take."
      },
      {
        question: "How do I access the pet first aid information?",
        answer: "Navigate to the 'Pet First Aid' section in our main menu. There you'll find comprehensive guides for various emergency situations."
      },
      {
        question: "Can I book veterinary appointments through your platform?",
        answer: "Currently, we don't offer direct appointment booking. Contact the veterinary clinic directly using the information provided in our listings."
      }
    ],
    shop: [
      {
        question: "How do I purchase products on the shop?",
        answer: "Browse our Shop section, select the items you want to purchase, add them to your cart, and proceed to checkout. You'll need to be logged in to complete a purchase."
      },
      {
        question: "How can I list my pet products for sale?",
        answer: "Go to 'Shop' and click on 'Create Listing'. Fill out the product details, upload images, set your price, and submit for review."
      },
      {
        question: "What payment methods are accepted?",
        answer: "We accept major credit cards, PayPal, and other secure payment methods. All transactions are processed securely."
      },
      {
        question: "How are shipping and returns handled?",
        answer: "Shipping methods and return policies vary by seller. Check the individual product listings for specific details, or contact the seller directly."
      }
    ],
    community: [
      {
        question: "How do I join discussions in the community forum?",
        answer: "Navigate to the 'Community' section and browse through existing topics or create a new post. You'll need to be logged in to participate."
      },
      {
        question: "What are the guidelines for posting in the community?",
        answer: "We encourage respectful, relevant discussions. Avoid spam, offensive content, or sharing personal contact information publicly. Full guidelines are available in the Community section."
      },
      {
        question: "Can I report inappropriate content?",
        answer: "Yes, each post and comment has a 'Report' option. Our moderation team reviews all reports and takes appropriate action."
      }
    ],
    verification: [
      {
        question: "What is the pet verification process?",
        answer: "Our verification system helps match lost pets with found pets by comparing details and photos. This helps reunite pets with their owners more efficiently."
      },
      {
        question: "How do I start a verification process?",
        answer: "If you've found a pet that matches a lost pet listing, click the 'Verify Match' button on the lost pet's profile. Follow the steps to submit your verification request."
      },
      {
        question: "What happens after I submit a verification?",
        answer: "The pet owner will review your submission. If they agree it's a match, you'll be connected to arrange the reunion. If they disagree, you can dispute the decision if you believe it's incorrect."
      },
      {
        question: "How can I check the status of my verification?",
        answer: "Go to 'My Verifications' in your profile to see all your verification requests and their current status."
      }
    ]
  };

  // Filter FAQs based on search query
  const filterFAQs = () => {
    if (!searchQuery) return faqCategories;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filteredCategories = {};
    
    Object.entries(faqCategories).forEach(([category, questions]) => {
      const filteredQuestions = questions.filter(
        item => 
          item.question.toLowerCase().includes(lowercaseQuery) || 
          item.answer.toLowerCase().includes(lowercaseQuery)
      );
      
      if (filteredQuestions.length > 0) {
        filteredCategories[category] = filteredQuestions;
      }
    });
    
    return filteredCategories;
  };

  const filteredFAQs = filterFAQs();
  const hasResults = Object.keys(filteredFAQs).length > 0;

  return (
    <div className="min-h-[calc(100vh-18.3rem)]">
      <div className="bg-gradient-to-r from-rose-100 to-amber-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <PageHeading pageName="Frequently Asked Questions" />
          <p className="text-lg text-gray-700 mt-4">
            Find answers to common questions about our platform and services.
          </p>
          
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for questions or keywords..."
              className="pl-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {searchQuery && !hasResults ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-medium mb-2">No results found</h3>
            <p className="text-gray-600">Try a different search term or browse categories below</p>
            <Button 
              className="mt-4 bg-rose-500 hover:bg-rose-600"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-6 flex flex-wrap h-auto p-1 gap-1">
              {Object.keys(filteredFAQs).map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize py-2 px-4 data-[state=active]:bg-rose-500 data-[state=active]:text-white"
                >
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(filteredFAQs).map(([category, questions]) => (
              <TabsContent key={category} value={category} className="w-full">
                <h2 className="text-2xl font-bold mb-4 capitalize border-l-4 border-rose-500 pl-4">
                  {category === "lostPets" 
                    ? "Lost & Found Pets" 
                    : category.replace(/([A-Z])/g, ' $1').trim()} Questions
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {questions.map((item, index) => (
                    <AccordionItem key={index} value={`${category}-item-${index}`}>
                      <AccordionTrigger className="text-lg font-semibold">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-base">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <div className="mt-12 bg-rose-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
          <p className="mb-4">We're here to help! Reach out to our support team.</p>
          <Button className="bg-rose-500 hover:bg-rose-600">Contact Support</Button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
