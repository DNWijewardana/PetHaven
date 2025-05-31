import { useAuth0 } from "@auth0/auth0-react";
import { NavLink, useLocation } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Cat,
  LayoutPanelLeft,
  LogOut,
  Menu as MenuIcon,
  PawPrint,
  User,
  Heart,
  HelpCircle,
  Phone,
  Home,
  Info,
  ListPlus,
  MapPin,
  MessageSquare,
  ShoppingBag,
  HeartPulse,
} from "lucide-react";
import { Button } from "./ui/button";

const mainNavItems = [
  {
    category: "Services",
    items: [
      { name: "Assist/Adopt", link: "/assist-or-adopt-pets", icon: <Heart className="w-4 h-4 mr-2" /> },
      { name: "Lost Pets", link: "/lost-pets", icon: <PawPrint className="w-4 h-4 mr-2" /> },
      { name: "Report Animal", link: "/report-lost-pet", icon: <Cat className="w-4 h-4 mr-2" /> },
      { name: "List for Adoption", link: "/list-for-adopt", icon: <ListPlus className="w-4 h-4 mr-2" /> },
      { name: "Nearby Vets", link: "/nearby-vets", icon: <MapPin className="w-4 h-4 mr-2" /> },
      { name: "Pet First Aid", link: "/pet-first-aid", icon: <HeartPulse className="w-4 h-4 mr-2" /> },
      { name: "Community Forum", link: "/community", icon: <MessageSquare className="w-4 h-4 mr-2" /> },
      // { name: "Volunteer System", link: "/volunteer", icon: <Users className="w-4 h-4 mr-2" /> },
      { name: "Donate", link: "/donate", icon: <Heart className="w-4 h-4 mr-2 text-rose-500" /> },
    ]
  },
  {
    category: "Information",
    items: [
      { name: "About Us", link: "/about", icon: <Info className="w-4 h-4 mr-2" /> },
      { name: "FAQ", link: "/faq", icon: <HelpCircle className="w-4 h-4 mr-2" /> },
      { name: "Contact Us", link: "/contact", icon: <Phone className="w-4 h-4 mr-2" /> },
    ]
  }
];

export default function Navbar() {
  const location = useLocation();
  const { pathname } = location;
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  
  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 shadow-sm border-b">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <NavLink to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-bold whitespace-nowrap dark:text-white">
            Pet<span className="text-rose-500">Haven</span>
          </span>
        </NavLink>

        {/* Mobile menu button */}
        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <MenuIcon className="w-5 h-5" />
        </button>

        {/* Desktop menu */}
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {/* Home link directly in the navbar */}
            <li className="nav-item">
              <NavLink 
                to="/" 
                className={`flex items-center px-3 py-2 text-gray-600 hover:text-rose-500 dark:text-gray-300 ${pathname === '/' ? 'text-rose-500 font-medium' : ''}`}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </NavLink>
            </li>
            
            {/* Shop link directly in the navbar */}
            <li className="nav-item">
              <NavLink 
                to="/shop" 
                className={`flex items-center px-3 py-2 text-gray-600 hover:text-rose-500 dark:text-gray-300 ${pathname === '/shop' ? 'text-rose-500 font-medium' : ''}`}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop
              </NavLink>
            </li>
            
            {mainNavItems.map((category, categoryIndex) => (
              <li key={categoryIndex} className="relative group">
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3 py-2 text-gray-600 hover:text-rose-500 dark:text-gray-300">
                    {category.category}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>{category.category}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {category.items.map((item, itemIndex) => (
                      <NavLink to={item.link} key={itemIndex}>
                        <DropdownMenuItem className={pathname === item.link ? "text-rose-500" : ""}>
                          {item.icon}
                          {item.name}
                        </DropdownMenuItem>
                      </NavLink>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <NavLink to="/profile">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </NavLink>
                  </DropdownMenuGroup>
                  {user?.isAdmin && (
                    <DropdownMenuGroup>
                      <NavLink to="/admin">
                        <DropdownMenuItem>
                          <LayoutPanelLeft className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                      </NavLink>
                    </DropdownMenuGroup>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                className="border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white"
                onClick={() => loginWithRedirect()}
              >
                Login
              </Button>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
