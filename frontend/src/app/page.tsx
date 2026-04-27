"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProfilePage from "@/components/ProfilePage";
import BottomNav from "@/components/BottomNav";
import CreditCardForm from "@/components/CreditCardForm";
import CalendarPage from "@/components/CalendarPage";
import ConnectPage from "@/components/ConnectPage"; // Import the new connect component

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Hero />;
      case "profile":
        return <ProfilePage />;
      case "calendar":
        return <CalendarPage />;
      case "payments":
        return <CreditCardForm />;
      case "connect":
        return <ConnectPage />;
      default:
        return <Hero />;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-black">
      {activeTab !== 'connect' && <Header />}
      <div className={`w-full h-full flex-grow ${activeTab !== 'connect' ? 'pt-16' : ''}`}>
        {renderContent()}
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}
