import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import axios from "axios";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Send } from "lucide-react";
import { toast } from "sonner";

const ENV = import.meta.env.MODE;

const BASE_URL =
  ENV === "development"
    ? "http://localhost:4000"
    : import.meta.env.VITE_BASE_URL;

export function ContactDialog(info: {
  name: string;
  owner: string;
  type: string;
}) {
  const { user } = useAuth0();
  const senderEmail = user?.email;
  const [senderName, setSenderName] = useState<string>("");
  const ownerEmail = info.owner;
  const petName = info.name;
  const [message, setMessage] = useState<string>("");
  const type = info.type;
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    try {
      setLoading(true);
      if (type == "lost") {
        const response = await axios.post(`${BASE_URL}/api/v1/email/lost`, {
          senderEmail,
          senderName,
          ownerEmail,
          petName,
          message,
        });
        toast(response.data.message);
      } else {
        const response = await axios.post(`${BASE_URL}/api/v1/email/adopt`, {
          senderEmail,
          senderName,
          ownerEmail,
          petName,
          message,
        });
        toast(response.data.message);
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        toast(JSON.stringify(error.response.data.message));
      } else {
        toast("An unexpected error occurred");
      }
    } finally {
      setMessage("");
      setSenderName("");
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-rose-500 hover:bg-rose-600 cursor-pointer hover:text-white transition-colors text-white"
        >
          Contact Reporter/Owner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Pet Reporter or Owner</DialogTitle>
          <DialogDescription>
            Contact the pet reporter,{" "}
            {type == "lost"
              ? "if you have any information about the lost pet"
              : "if you are interested in help for this pet or adoption"}{" "}
            <span className="font-bold">{petName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <Label htmlFor="name" className="mb-2">
            Name
          </Label>
          <Input
            id="name"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full"
          />
          <Label htmlFor="name" className="mb-2 mt-4">
            Message
          </Label>
          <Textarea
            placeholder="Type your message here..."
            className="mb-2 w-full"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={loading}
            type="submit"
            variant={"default"}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
            onClick={() => {
              handleSendMessage();
            }}
          >
            <Send />
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
