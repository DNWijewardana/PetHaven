import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import contactImage from "@/assets/images/contact-image.svg";

const ContactUs = () => {
  return (
    <>
      <div className="min-h-[calc(100vh-18.3rem)]">
        <PageHeading pageName="Contact Us" />
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex md:flex-row gap-4 flex-col">
            <img
              src={contactImage}
              alt="Contact Image"
              className="md:flex-2/5 md:max-w-2/5 w-full max-w-md mx-auto"
            />
            <Card className="flex-1/2 max-h-fit p-4 gap-0">
              <Label className="text-xl">Full Name</Label>
              <Input
                type="text"
                className="mb-2"
                placeholder="What is your name?"
              />
              <Label className="text-xl">Email</Label>
              <Input
                type="email"
                className="mb-2"
                placeholder="What is your email?"
              />
              <Label className="text-xl">Message</Label>
              <Textarea className="mb-2" placeholder="What is your message?" />
              <Button
                className="flex flex-row items-center justify-center gap-2 mt-4 w-full bg-rose-500 hover:bg-rose-600 cursor-pointer text-white"
                variant="default"
              >
                <Send />
                Submit
              </Button>
              <p className="text-xs mt-2">
                By submitting this form, you agree to our{" "}
                <a href="#" className="text-rose-500">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-rose-500">
                  Privacy Policy
                </a>
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
