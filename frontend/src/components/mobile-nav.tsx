import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Cat,
  ChevronsRight,
  Hospital,
  LayoutPanelLeft,
  LogOut,
  PawPrint,
  User,
  Shield,
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
import { Menu as MenuIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { NavLink, useLocation } from "react-router-dom";

const mobileItems = [
  {
    name: "HOME",
    link: "/",
  },
  {
    name: "SHOP",
    link: "/shop",
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
    name: "LIST FOR ADOPTION",
    link: "/list-for-adopt",
  },
  {
    name: "NEARBY VETS",
    link: "/nearby-vets",
  },
  {
    name: "FIND VET CLINICS",
    link: "/vet-locator",
  },
  {
    name: "SEARCH SERVICES",
    link: "/vet-services",
  },
  {
    name: "COMMUNITY FORUM",
    link: "/community",
  },
  {
    name: "VOLUNTEER",
    link: "/volunteer",
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
];

export default function MobileNav() {
  const location = useLocation();
  const { pathname } = location;
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* This button will trigger open the mobile sheet menu */}
      <div className="flex gap-2 items-center md:hidden w-full">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon style={{ width: "24px", height: "24px" }} />
          </Button>
        </SheetTrigger>
        <div className="w-full flex flex-row items-center justify-between">
          <NavLink to={"/"}>
            <h1 className="text-2xl font-bold">
              Pet<span className="text-rose-500">Haven</span>
            </h1>
          </NavLink>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-row items-center gap-2">
                  <Avatar className="shadow cursor-pointer">
                    <AvatarImage src={`${user?.picture}`} alt="@shadcn" />
                    <AvatarFallback>{user?.name}</AvatarFallback>
                  </Avatar>
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
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              className="cursor-pointer hover:text-white bg-rose-500 text-md transition-colors hover:bg-rose-600"
              onClick={() => loginWithRedirect()}
            >
              Login
            </Button>
          )}
        </div>
      </div>

      <SheetContent side="left" unselectable="on">
        <div className="flex p-4 flex-col items-start">
          <NavLink to={"/"}>
            <SheetTitle className="text-xl pb-3 font-bold">
              Pet<span className="text-rose-500">Haven</span>
            </SheetTitle>
          </NavLink>
          <DialogDescription className="hidden"></DialogDescription>
          <Separator className="mb-3" />
          {mobileItems.map((item, index) => (
            <NavLink
              className={`flex min-h-10 flex-row items-center rounded-md px-2 hover:no-underline hover:bg-rose-600 hover:text-white transition-colors ${
                pathname == item.link
                  ? "bg-rose-500 text-white"
                  : "bg-rose-50 border"
              } active:border-rose-400 w-full mt-2`}
              key={index}
              to={item.link}
              onClick={() => {
                setOpen(false);
              }}
            >
              <ChevronsRight />
              <span className="w-full text-left">{item.name}</span>
            </NavLink>
          ))}
        </div>
        <div className="flex mt-auto p-4 flex-col items-start">
          <Separator />
          <div className="flex gap-2 mt-4 w-full">
            {isAuthenticated ? (
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex flex-row items-center gap-2">
                  <Avatar className="shadow cursor-pointer">
                    <AvatarImage src={`${user?.picture}`} alt="@shadcn" />
                    <AvatarFallback>{user?.name}</AvatarFallback>
                  </Avatar>
                  <span>{user?.name}</span>
                </div>
                <LogOut onClick={() => logout()} />
              </div>
            ) : (
              <Button
                variant="default"
                className="cursor-pointer w-full hover:text-white bg-rose-500 text-md transition-colors hover:bg-rose-600"
                onClick={() => loginWithRedirect()}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
