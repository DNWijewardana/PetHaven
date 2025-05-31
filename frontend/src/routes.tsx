import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import CommunityForum from "./pages/community/forum";
import NewPost from "./pages/community/new-post";
import EditPost from "./pages/community/edit-post";
import PostDetails from "./pages/community/post-details";
import VolunteerOpportunities from "./pages/volunteer/opportunities";
import NewOpportunity from "./pages/volunteer/new-opportunity";
import EditOpportunity from "./pages/volunteer/edit-opportunity";
import OpportunityDetails from "./pages/volunteer/opportunity-details";
import ApplicationForm from "./pages/volunteer/application-form";
import Shop from "./pages/shop";
import ProductDetails from "./pages/shop/product-details";
import PetFirstAid from "./pages/pet-first-aid";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/shop",
    element: <Shop />,
  },
  {
    path: "/shop/product/:id",
    element: <ProductDetails />,
  },
  {
    path: "/pet-first-aid",
    element: <PetFirstAid />,
  },
  {
    path: "/community",
    element: <CommunityForum />,
  },
  {
    path: "/community/new-post",
    element: <NewPost />,
  },
  {
    path: "/community/post/:id",
    element: <PostDetails />,
  },
  {
    path: "/community/edit/:id",
    element: <EditPost />,
  },
  {
    path: "/volunteer",
    element: <VolunteerOpportunities />,
  },
  {
    path: "/volunteer/new",
    element: <NewOpportunity />,
  },
  {
    path: "/volunteer/edit/:id",
    element: <EditOpportunity />,
  },
  {
    path: "/volunteer/:id",
    element: <OpportunityDetails />,
  },
  {
    path: "/volunteer/apply/:id",
    element: <ApplicationForm />,
  }
]); 