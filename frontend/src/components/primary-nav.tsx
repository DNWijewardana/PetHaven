import { Button } from "./ui/button";
import {
  Cat,
  Hospital,
  LayoutPanelLeft,
  LogOut,
  PawPrint,
  User,
  Shield,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { NavLink, useLocation } from "react-router-dom";

const mainNavItems = [
  {
    name: "HOME",
    link: "/",
  },
  {
    name: "ASSIST/ADOPT",
    link: "/assist-or-adopt-pets",
  },
  {
    name: "LOST PETS",
    link: "/lost-pets",
  },
  {
    name: "REPORT",
    link: "/report-lost-pet",
  },
  {
    name: "ABOUT",
    link: "/about",
  },
  {
    name: "FAQ",
    link: "/faq",
  },
  {
    name: "CONTACT US",
    link: "/contact",
  },
  {
    name: "DONATE",
    link: "/donate",
  },
];

export default function MainNav() {
  const location = useLocation();
  const { pathname } = location;
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  return (
    <div className="hidden gap-2 md:flex w-full items-center px-4 justify-between">
      <NavLink to={"/"}>
        <h1 className="text-2xl font-bold">
          Pet<span className="text-rose-500">Haven</span>
        </h1>
      </NavLink>
      <div className="flex gap-2">
        {mainNavItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.link}
            className={`cursor-pointer py-1 px-4 rounded-md ${
              pathname == item.link ? "bg-rose-500 text-white" : ""
            } hover:bg-rose-500 hover:text-white transition-colors ${
              item.name === "DONATE" ? "bg-rose-100 border border-rose-500 flex items-center gap-1" : ""
            }`}
          >
            {item.name === "DONATE" && <Heart className="h-4 w-4" />}
            {item.name}
          </NavLink>
        ))}
      </div>
      <div className="flex gap-2">
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex flex-row items-center bg-rose-100 md:bg-transparent lg:bg-rose-200 hover:bg-rose-200 border-2 md:border-0 lg:border border-rose-500 text-nowrap rounded-full pl-1 py-1 pr-2 md:pr-1 lg:pr-2 gap-2">
                <Avatar className="shadow cursor-pointer">
                  <AvatarImage src={`${user?.picture}`} alt="PetHaven" />
                  <AvatarFallback>{user?.name}</AvatarFallback>
                </Avatar>
                <span className="block md:hidden lg:block">{user?.name}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <NavLink to="/profile">
                  <DropdownMenuItem className="cursor-pointer focus:bg-rose-100">
                    <User />
                    <span>My Profile</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </NavLink>
                <NavLink to="/my-pets">
                  <DropdownMenuItem className="cursor-pointer focus:bg-rose-100">
                    <PawPrint className="h-4 w-4 mr-2" />
                    <span>My Pets</span>
                  </DropdownMenuItem>
                </NavLink>
                <NavLink to="/my-verifications">
                  <DropdownMenuItem className="cursor-pointer focus:bg-rose-100">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>My Verifications</span>
                  </DropdownMenuItem>
                </NavLink>
              </DropdownMenuGroup>
              {isAuthenticated && user?.isAdmin && (
                <DropdownMenuGroup>
                  <NavLink to="/admin">
                    <DropdownMenuItem className="cursor-pointer focus:bg-rose-100">
                      <LayoutPanelLeft />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  </NavLink>
                </DropdownMenuGroup>
              )}
              <DropdownMenuGroup>
                <NavLink to="/report-lost-pet">
                  <DropdownMenuItem className="cursor-pointer focus:bg-rose-100">
                    <Cat />
                    <span>Report Lost Pet</span>
                  </DropdownMenuItem>
                </NavLink>
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <NavLink to="/list-for-adopt">
                  <DropdownMenuItem className="cursor-pointer focus:bg-rose-100">
                    <PawPrint />
                    <span>List For Assist/Adoption</span>
                  </DropdownMenuItem>
                </NavLink>
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <NavLink to="/nearby-vets">
                  <DropdownMenuItem className="cursor-pointer focus:bg-rose-100">
                    <Hospital />
                    <span>Nearby Vets</span>
                  </DropdownMenuItem>
                </NavLink>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer focus:bg-rose-100">
                <LogOut />
                <span onClick={() => logout()}>Logout</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant={"outline"}
            className="cursor-pointer hover:text-white border-rose-500 border-2 transition-colors hover:bg-rose-600"
            onClick={() => loginWithRedirect()}
          >
            LOG IN
          </Button>
        )}
      </div>
    </div>
  );
}
