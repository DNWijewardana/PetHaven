import { ContactDialog } from "./contact-dialog";
import { Card } from "./ui/card";
import { lostPetProps } from "@/types/PetTypes";
import { format } from "date-fns";
import { useAuth0 } from '@auth0/auth0-react';
import VerifyPetButton from "./verification/VerifyPetButton";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "./ui/button";

const ENV = import.meta.env.MODE;
const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

const LostPetCard = ({ pet, onDelete }: { pet: lostPetProps; onDelete?: () => void }) => {
  const { user } = useAuth0();
  const isOwner = user?.email === pet.owner;

  const handleDelete = async () => {
    if (!isOwner || !user?.email) return;
    
    try {
      const response = await axios.delete(`${BASE_URL}/api/v1/pet/delete`, {
        data: { id: pet._id, owner: user.email },
      });
      
      if (response.data.success) {
        toast.success("Pet deleted successfully!");
        if (onDelete) onDelete();
      } else {
        toast.error("Failed to delete pet.");
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Failed to delete pet. Please try again.");
    }
  };

  return (
    <Card
      key={pet._id}
      className="p-4 rounded-lg shadow-sm hover:shadow-lg transition-all hover:border-rose-500 hover:bg-rose-100 flex flex-col justify-between"
    >
      <div className="w-full flex flex-col gap-2 relative">
        {isOwner && (
          <Button
            onClick={handleDelete}
            className="absolute top-2 right-2 z-10 p-2 bg-red-500 hover:bg-red-600 rounded-full h-8 w-8 flex items-center justify-center"
            variant="destructive"
            size="icon"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </Button>
        )}
        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <h2 className="text-xl font-bold">
          {pet.name} <span className="font-normal">lost at</span> {pet.location}
        </h2>
        <p className="text-gray-800 line-clamp-3">{pet.description}</p>
        <p className="text-gray-800">
          Lost on {pet.date && format(new Date(pet.date), "do MMMM, yyyy")}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <ContactDialog name={pet.name} owner={pet.owner} type={pet.type} />
        <VerifyPetButton pet={pet} isOwner={isOwner} />
      </div>
    </Card>
  );
};

export default LostPetCard;
