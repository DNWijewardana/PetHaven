import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Heart, PawPrint, Shield, Check } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/constants";

const DonationPage = () => {
  const { user } = useAuth0();
  const [selectedAmount, setSelectedAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donationType, setDonationType] = useState<string>("ONE_TIME");
  const [purpose, setPurpose] = useState<string>("GENERAL");
  const [paymentMethod, setPaymentMethod] = useState<string>("CREDIT_CARD");
  const [name, setName] = useState<string>(user?.name || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [phone, setPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [reference, setReference] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = customAmount ? parseInt(customAmount) : parseInt(selectedAmount);
    
    if (!name || !email) {
      toast.error("Please provide your name and email");
      return;
    }
    
    if (isNaN(amount) || amount < 100) {
      toast.error("Please enter a valid amount (minimum LKR 100)");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call the backend API
      // For demo purposes, we'll simulate a successful response
      setTimeout(() => {
        setShowSuccess(true);
        setReference(`DON-${Math.floor(10000 + Math.random() * 90000)}-${Date.now().toString().slice(-6)}`);
        toast.success("Thank you for your donation!");
        setIsSubmitting(false);
      }, 1500);
      
    } catch (error) {
      console.error("Donation error:", error);
      toast.error("There was a problem processing your donation. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-18.3rem)]">
      <div className="bg-gradient-to-r from-rose-100 to-amber-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <PageHeading pageName="Support Our Animal Welfare Programs" />
          <p className="text-lg text-gray-700 mt-4">
            Your donation helps us rescue and provide care for animals in need across Sri Lanka.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {showSuccess ? (
              <Card className="border-green-100 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You for Your Donation!</h2>
                    <p className="text-green-700">Your generosity helps us make a difference for animals in need.</p>
                  </div>
                  
                  {paymentMethod === "BANK_TRANSFER" ? (
                    <div className="bg-white p-6 rounded-lg mb-6">
                      <h3 className="font-semibold text-lg mb-4">Bank Transfer Instructions</h3>
                      <p className="mb-4">Please complete your donation by transferring funds to:</p>
                      <ul className="space-y-2 mb-4">
                        <li><span className="font-medium">Account Name:</span> PawHaven Animal Welfare</li>
                        <li><span className="font-medium">Account Number:</span> 1234567890</li>
                        <li><span className="font-medium">Bank:</span> Commercial Bank of Sri Lanka</li>
                        <li><span className="font-medium">Branch:</span> Colombo Main</li>
                        <li><span className="font-medium">Reference:</span> {reference}</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-lg mb-6">
                      <h3 className="font-semibold text-lg mb-4">Donation Details</h3>
                      <p>A receipt has been sent to your email.</p>
                      <p>Reference: {reference}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => setShowSuccess(false)} 
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Make Another Donation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <Tabs defaultValue="credit-card" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="credit-card" onClick={() => setPaymentMethod("CREDIT_CARD")}>
                        Credit/Debit Card
                      </TabsTrigger>
                      <TabsTrigger value="bank-transfer" onClick={() => setPaymentMethod("BANK_TRANSFER")}>
                        Bank Transfer
                      </TabsTrigger>
                      <TabsTrigger value="mobile-payment" onClick={() => setPaymentMethod("MOBILE_PAYMENT")}>
                        Mobile Payment
                      </TabsTrigger>
                    </TabsList>
                    
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-6">
                        <div>
                          <Label className="text-base font-medium mb-3 block">Donation Amount (LKR)</Label>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            {["500", "1000", "2500", "5000", "10000", "25000"].map((amount) => (
                              <Button
                                key={amount}
                                type="button"
                                variant={selectedAmount === amount ? "default" : "outline"}
                                className={selectedAmount === amount ? "bg-rose-500 hover:bg-rose-600" : ""}
                                onClick={() => {
                                  setSelectedAmount(amount);
                                  setCustomAmount("");
                                }}
                              >
                                LKR {parseInt(amount).toLocaleString()}
                              </Button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="customAmount">Custom Amount:</Label>
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">LKR</span>
                              <Input
                                id="customAmount"
                                type="number"
                                min="100"
                                placeholder="Enter amount"
                                className="pl-12"
                                value={customAmount}
                                onChange={(e) => {
                                  setCustomAmount(e.target.value);
                                  setSelectedAmount("");
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-medium mb-3 block">Donation Frequency</Label>
                          <RadioGroup 
                            defaultValue="ONE_TIME" 
                            className="flex gap-4" 
                            value={donationType}
                            onValueChange={setDonationType}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="ONE_TIME" id="one-time" />
                              <Label htmlFor="one-time">One-time</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="MONTHLY" id="monthly" />
                              <Label htmlFor="monthly">Monthly</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-base font-medium mb-3 block">Donation Purpose</Label>
                          <Select defaultValue="GENERAL" onValueChange={setPurpose}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="RESCUE">Animal Rescue Operations</SelectItem>
                              <SelectItem value="MEDICAL">Medical Care for Animals</SelectItem>
                              <SelectItem value="FEEDING">Animal Feeding Programs</SelectItem>
                              <SelectItem value="GENERAL">General Support</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name*</Label>
                              <Input 
                                id="name" 
                                placeholder="Your Name" 
                                required 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email*</Label>
                              <Input 
                                id="email" 
                                type="email" 
                                placeholder="your.email@example.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                              id="phone" 
                              placeholder="07X XXX XXXX"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="notes">Message (Optional)</Label>
                            <Textarea 
                              id="notes" 
                              placeholder="Any special notes or dedication"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                          </div>
                        </div>

                        <TabsContent value="credit-card">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">Card Number*</Label>
                              <Input id="cardNumber" placeholder="XXXX XXXX XXXX XXXX" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date*</Label>
                                <Input id="expiry" placeholder="MM/YY" required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cvc">CVC*</Label>
                                <Input id="cvc" placeholder="XXX" required />
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="bank-transfer">
                          <div className="text-sm text-gray-600 border border-gray-200 rounded p-4 mb-4">
                            <p>You will receive bank transfer details after submission.</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="mobile-payment">
                          <div className="text-sm text-gray-600 border border-gray-200 rounded p-4 mb-4">
                            <p>You will be redirected to a secure mobile payment platform.</p>
                          </div>
                        </TabsContent>

                        <Button 
                          type="submit" 
                          className="w-full bg-rose-500 hover:bg-rose-600"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Processing..." : `Donate LKR ${customAmount || selectedAmount}`}
                        </Button>

                        <p className="text-sm text-gray-500 text-center">
                          Your donation is secure and encrypted.
                        </p>
                      </div>
                    </form>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Heart className="h-5 w-5 text-rose-500 mr-2" />
                  Your Donation Supports
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <PawPrint className="h-5 w-5 text-rose-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Animal Rescue</p>
                      <p className="text-sm text-gray-600">Supporting rescue efforts for abandoned and stray animals across Sri Lanka.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-rose-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Medical Treatment</p>
                      <p className="text-sm text-gray-600">Providing essential medical care for animals in need.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="flex items-center text-green-800 font-semibold mb-3">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                Tax Deductible
              </h3>
              <p className="text-green-700 text-sm">
                Your donation is tax-deductible in Sri Lanka. We will provide a receipt for your tax records.
              </p>
            </div>
          </div>
        </div>

        <div className="my-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-rose-500">1,500+</p>
              <p className="mt-2 text-gray-700">Animals Rescued</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-rose-500">850+</p>
              <p className="mt-2 text-gray-700">Animals Treated</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-rose-500">500+</p>
              <p className="mt-2 text-gray-700">Animals Rehomed</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-rose-500">25+</p>
              <p className="mt-2 text-gray-700">Communities Reached</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage; 