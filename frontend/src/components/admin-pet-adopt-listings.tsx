import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Save,
  Trash,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { adoptPetProps, lostPetProps } from "@/types/PetTypes";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const ENV = import.meta.env.MODE;

const BASE_URL =
  ENV === "development"
    ? "http://localhost:4000"
    : import.meta.env.VITE_BASE_URL;

interface AdminPetAdoptionListingsProps {
  refreshTrigger?: boolean;
  showAll?: boolean;
}

const AdminPetAdoptionListings = ({ refreshTrigger = false, showAll = false }: AdminPetAdoptionListingsProps) => {
  const { user, isLoading } = useAuth0();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [adminAdoptPets, setAdminAdoptPets] = useState<lostPetProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [petId, setPetId] = useState<string>("");
  const [petName, setPetName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // Track the opened dropdown

  // Ensure userEmail is updated when Auth0 user is available
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const fetchMyLostPets = async () => {
      if (!userEmail) {
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/pets/adopt`);
        let pets = response.data.pets || [];
        
        // If not showing all, limit to the first 5 items
        if (!showAll && pets.length > 5) {
          pets = pets.slice(0, 5);
        }
        
        setAdminAdoptPets(pets);
      } catch (error) {
        console.error("API Error:", error);
        toast(
          axios.isAxiosError(error) && error.response
            ? error.response.data.message
            : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyLostPets();
  }, [userEmail, refreshTrigger, showAll]);

  const handleDropdownToggle = (petId: string) => {
    setOpenDropdownId(openDropdownId === petId ? null : petId); // Toggle dropdown for a specific pet
  };

  const handleUpdatePet = async () => {
    if (!userEmail) return;
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/pet/adopt/update/admin`,
        {
          id: petId,
          name: petName,
          description,
          location,
          type,
        }
      );
      if (response.data.success) {
        setAdminAdoptPets((prev) =>
          prev.map((pet) =>
            pet._id === petId ? { ...pet, ...response.data.pet } : pet
          )
        );
      } else {
        toast.error("Failed to update pet details.");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast(
        axios.isAxiosError(error) && error.response
          ? error.response.data.message
          : "An unexpected error occurred"
      );
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!userEmail) return;
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/v1/pet/delete/admin`,
        {
          data: { id: petId },
        }
      );
      if (response.data.success) {
        setAdminAdoptPets((prev) => prev.filter((pet) => pet._id !== petId));
        toast.success("Pet deleted successfully!");
      } else {
        toast.error("Failed to delete pet.");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast(
        axios.isAxiosError(error) && error.response
          ? error.response.data.message
          : "An unexpected error occurred"
      );
    }
  };

  return (
    <>
      {loading || isLoading ? (
        <p className="text-center flex flex-row items-center w-full justify-center gap-1 mt-2">
          <LoaderCircle className="animate-spin" />
          Loading pets to adopt...
        </p>
      ) : (
        <Table className="w-full mt-4">
          <TableHeader className="bg-rose-100">
            <TableRow>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold max-w-56">Description</TableHead>
              <TableHead className="font-bold text-nowrap">Location</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminAdoptPets.length > 0 ? (
              adminAdoptPets.map((pet: adoptPetProps) => (
                <TableRow key={pet._id}>
                  <TableCell className="font-medium">{pet.name}</TableCell>
                  <TableCell className="max-w-24 text-ellipsis overflow-hidden">
                    {pet.description}
                  </TableCell>
                  <TableCell>{pet.location}</TableCell>
                  <TableCell className="capitalize max-w-24 text-ellipsis overflow-hidden">
                    {pet.type == "adopt" ? "Available" : "Adopted"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu
                      open={openDropdownId === pet._id}
                      onOpenChange={() => handleDropdownToggle(pet._id)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setPetId(pet._id);
                            setPetName(pet.name);
                            setLocation(pet.location);
                            setDescription(pet.description);
                            setType(pet.type);
                            setIsDialogOpen(true);
                            setOpenDropdownId(null);
                          }}
                        >
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDeletePet(pet._id)}
                        >
                          <Trash className="text-red-500" />
                          <span className="text-red-500">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No adoption listings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Update Pet Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Pet</DialogTitle>
            <DialogDescription>Update pet details</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col">
            <Label htmlFor="name" className="mb-2">
              Name
            </Label>
            <Input
              id="name"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Enter new pet name..."
              className="w-full"
            />
            <Label htmlFor="description" className="mb-2 mt-4">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type description here..."
              className="mb-2 w-full"
            />
            <Label htmlFor="location" className="mb-2">
              Location
            </Label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              id="location"
              placeholder="Enter location..."
              className="w-full"
            />
            <Label htmlFor="type" className="mb-2 mt-4">
              Status
            </Label>
            <Select onValueChange={setType} defaultValue={type}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={type == "adopt" ? "Available" : "Adopted"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Found/Lost</SelectLabel>
                  <SelectItem value="adopt" className="capitalize">
                    Available
                  </SelectItem>
                  <SelectItem value="adopted" className="capitalize">
                    Adopted
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              disabled={loading}
              variant="default"
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
              onClick={async () => {
                setLoading(true);
                await handleUpdatePet();
                setLoading(false);
                setIsDialogOpen(false);
                toast.success("Pet updated successfully!");
              }}
            >
              <Save />
              {loading ? "Updating..." : "Update Pet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPetAdoptionListings;
