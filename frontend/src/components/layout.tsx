import { ReactNode } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import Chatbot from "./chatbot";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Layout; 