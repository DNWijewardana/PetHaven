import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./index.css";
import Layout from "./components/layout.tsx";
import ReportLostPet from "./pages/report-lost-pet.tsx";
import NearbyVets from "./pages/nearby-vets.tsx";
import ListForAdopt from "./pages/list-for-adopt.tsx";
import LostPets from "./pages/lost-pets.tsx";
import FindVets from "./pages/find-vets.tsx";
import VetLocatorUnified from "./pages/vet-locator-unified.tsx";
import About from "./pages/about.tsx";
import Contact from "./pages/contact-us.tsx";
import PostDetails from "./pages/community/post-details.tsx";
import Forum from "./pages/community/forum.tsx";
import NewPost from "./pages/community/new-post.tsx";
import EditPost from "./pages/community/edit-post.tsx";
import AdminDashboard from "./pages/admin-dashboard.tsx";
import MyProfile from "./pages/my-profile.tsx";
import FAQ from "./pages/faq.tsx";
import AssistOrAdoptPets from "./pages/assist-or-adopt-pets.tsx";
import ScrollToTop from "./components/scroll-to-top.tsx";
import Shop from "./pages/shop.tsx";
import ProductDetails from "./pages/shop/product-details.tsx";
import CreateListing from "./pages/shop/create-listing.tsx";
import PetFirstAid from "./pages/pet-first-aid.tsx";
import MyVerifications from "./pages/my-verifications.tsx";
import VerificationDetail from "./pages/verification-detail.tsx";
import DisputeVerification from "./pages/dispute-verification.tsx";
import DonationPage from "./pages/donation.tsx";
import AddEditPet from "./pages/add-edit-pet.tsx";
import MyPets from "./pages/my-pets.tsx";
import PetProfile from "./pages/pet-profile.tsx";

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={AUTH0_DOMAIN}
        clientId={AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        <Toaster position="top-center" />
        <Layout>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/report-lost-pet" element={<ReportLostPet />} />
            <Route path="/nearby-vets" element={<NearbyVets />} />
            <Route path="/list-for-adopt" element={<ListForAdopt />} />
            <Route path="/lost-pets" element={<LostPets />} />
            <Route path="/find-vets" element={<FindVets />} />
            <Route path="/vet-locator" element={<VetLocatorUnified />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/community" element={<Forum />} />
            <Route path="/community/new-post" element={<NewPost />} />
            <Route path="/community/post/:id" element={<PostDetails />} />
            <Route path="/community/edit/:id" element={<EditPost />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/assist-or-adopt-pets" element={<AssistOrAdoptPets />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/product/:id" element={<ProductDetails />} />
            <Route path="/shop/create-listing" element={<CreateListing />} />
            <Route path="/pet-first-aid" element={<PetFirstAid />} />
            <Route path="/my-verifications" element={<MyVerifications />} />
            <Route path="/verifications/:verificationId" element={<VerificationDetail />} />
            <Route path="/dispute/:verificationId" element={<DisputeVerification />} />
            <Route path="/donate" element={<DonationPage />} />
            <Route path="/add-edit-pet/:petId?" element={<AddEditPet />} />
            <Route path="/my-pets" element={<MyPets />} />
            <Route path="/pet/:profileId" element={<PetProfile />} />
          </Routes>
        </Layout>
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
);
