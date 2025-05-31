import { ContactDialog } from "./contact-dialog";
import { Card } from "./ui/card";
import { lostPetProps } from "@/types/PetTypes";
import { format } from "date-fns";
import { useAuth0 } from '@auth0/auth0-react';
import VerifyPetButton from "./verification/VerifyPetButton";

const LatestPetCard = ({ pet }: { pet: lostPetProps }) => {
  const { user } = useAuth0();
  const isOwner = user?.email === pet.owner;

  return (
    <Card
      key={pet._id}
      className="p-4 rounded-lg relative shadow-sm hover:shadow-lg overflow-hidden transition-all hover:border-rose-500 hover:bg-rose-100 flex flex-col justify-between"
    >
      <p
        className={`absolute text-xs rotate-45 -right-6 text-center  ${
          pet.type == "lost" ? "bg-rose-500" : "bg-green-500"
        } px-8 text-white`}
      >
        {pet.type === "lost" ? "Lost" : "Support"}
      </p>
      <div className="w-full flex flex-col gap-2">
        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <h2 className="text-xl font-bold">
          {pet.name}{" "}
          <span className="font-normal">
            {pet.type === "lost" ? "was lost at" : "can be find or adopted at"}
          </span>{" "}
          {pet.location}
        </h2>
        <p className="text-gray-800 line-clamp-3">{pet.description}</p>
        {pet.date && (
          <p className="text-gray-800">
            Lost on {pet.date && format(new Date(pet.date), "do MMMM, yyyy")}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <ContactDialog name={pet.name} owner={pet.owner} type={pet.type} />
        {pet.type === 'lost' || pet.type === 'found' ? (
          <VerifyPetButton pet={pet} isOwner={isOwner} />
        ) : null}
      </div>
    </Card>
  );
};

export default LatestPetCard;
