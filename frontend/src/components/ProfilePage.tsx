"use client";
import { useState } from "react";
import EditProfileModal from "./EditProfileModal";
import { User, Settings, LogOut, Bell, ChevronRight, Camera, ImageIcon } from "lucide-react";

interface ProfileUser {
    name: string;
    email: string;
    avatarUrl: string;
    bio: string;
    photos: string[];
}

export default function ProfilePage() {
    const [user, setUser] = useState<ProfileUser>({
        name: "Alex Morgan",
        email: "alex.morgan@coparent.com",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        bio: "Co-parenting superstar. Juggling life one day at a time. Looking for a partner in crime who gets it. My kids are my world, but I'm ready to find my own happiness too.",
        photos: [
            "/placeholder-f.jpg",
            "/placeholder-f1.jpg",
            "/placeholder-m1.jpg",
            "/placeholder-m2.jpg",
            "/placeholder-f2.jpg",
        ]
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUpdateUser = (updatedUser: Omit<ProfileUser, 'avatarUrl' | 'photos' | 'bio'>) => {
        setUser(prev => ({ ...prev, ...updatedUser }));
    };

    const menuItems = [
      { id: "account", icon: User, label: "Account Settings",},
      { id: "notifications", icon: Bell, label: "Notifications",},
      { id: "settings", icon: Settings, label: "App Settings",},
    ]

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="w-full pt-12 pb-4 px-6 flex items-center justify-center">
                <h1 className="text-xl font-bold text-white">Profile</h1>
            </header>

            <main className="flex-grow p-6 pt-4">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 to-rose-500 p-1 mb-4">
                        <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover border-4 border-black" />
                         <button className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center border-2 border-black">
                            <Camera size={16} />
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-zinc-400">{user.email}</p>
                     <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 px-6 py-2 rounded-full bg-zinc-800 text-white font-semibold hover:bg-zinc-700 transition-colors text-sm"
                    >
                        Edit Profile
                    </button>
                </div>

                {/* Bio Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-white mb-2">About Me</h3>
                    <p className="text-zinc-400 text-sm">{user.bio}</p>
                </div>

                {/* Photo Gallery */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-white">My Photos</h3>
                         <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700">
                           <ImageIcon size={18} />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {user.photos.map((photo, index) => (
                            <div key={index} className="aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                                <img src={photo} alt={`User photo ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                         <div className="aspect-square bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center">
                            <Camera size={24} className="text-zinc-600" />
                        </div>
                    </div>
                </div>


                <div className="space-y-3">
                    {menuItems.map(item => (
                       <button key={item.id} className="w-full flex justify-between items-center text-left bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-colors hover:bg-zinc-800/80 active:bg-zinc-800">
                           <div className="flex items-center gap-4">
                               <item.icon className="text-zinc-400" size={22} />
                               <span className="text-base font-medium text-white">{item.label}</span>
                           </div>
                           <ChevronRight className="text-zinc-600" size={20} />
                       </button>
                    ))}
                </div>

                 <button className="mt-8 w-full flex items-center justify-center gap-3 text-left bg-zinc-900 border border-rose-500/30 rounded-xl p-4 transition-colors text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20">
                    <LogOut size={20} />
                    <span className="text-base font-semibold">Sign Out</span>
                </button>
            </main>
            
            <EditProfileModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={user}
                onSave={handleUpdateUser}
            />
        </div>
    );
}
