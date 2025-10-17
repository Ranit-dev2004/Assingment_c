import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateEvent from "../Components/CreateEvent.jsx";
import Event from "../Components/Events.jsx";
import { Search } from "lucide-react";

const MainPage = () => {
  const [events, setEvents] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newProfile, setNewProfile] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  // ✅ Fetch profiles when popup opens
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await axios.get("https://assingment-b.onrender.com/api/profiles");
        setProfiles(res.data);
      } catch (err) {
        console.error("Error fetching profiles:", err);
      }
    };
    if (showPopup) fetchProfiles();
  }, [showPopup]);

  // ✅ Add new profile
  const handleAddProfile = async () => {
    if (!newProfile.trim()) return;
    try {
      const res = await axios.post("https://assingment-b.onrender.com/api/profiles", {
        name: newProfile.trim(),
        timezone: "UTC",
      });
      setProfiles((prev) => [...prev, res.data]);
      setNewProfile("");
    } catch (err) {
      console.error("Error adding profile:", err);
    }
  };

  // ✅ Fetch events for selected profile
  const fetchEvents = async (profileId) => {
    try {
      const res = await axios.get("https://assingment-b.onrender.com/api/events");
      const userEvents = res.data.filter((event) =>
        event.profiles.some((p) => p._id === profileId)
      );
      setEvents(userEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  // ✅ Handle selecting a profile
  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setShowPopup(false);
    fetchEvents(profile._id);
  };

  // ✅ Handle event creation
  const handleCreateEvent = (event) => {
    setEvents((prev) => [...prev, event]);
  };

  // ✅ Handle event update (used by Event.jsx)
  const handleEventUpdate = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 ml-48">
        <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
        <button
          onClick={() => setShowPopup(!showPopup)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md border mr-48"
        >
          {selectedProfile ? selectedProfile.name : "Select current profile..."}
        </button>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl ml-52">
        <CreateEvent onCreate={handleCreateEvent} />
        <Event events={events} onUpdate={handleEventUpdate} />
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="absolute top-20 right-52 z-50">
          <div className="bg-white border border-gray-200 shadow-lg rounded-lg w-64">
            {/* Search Bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search profile..."
                className="flex-1 text-sm outline-none"
              />
            </div>

            {/* Profiles */}
            {profiles.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-3">
                No profiles found.
              </p>
            ) : (
              <ul className="max-h-40 overflow-y-auto">
                {profiles
                  .filter((p) =>
                    p.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((p) => (
                    <li
                      key={p._id}
                      onClick={() => handleSelectProfile(p)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {p.name}
                    </li>
                  ))}
              </ul>
            )}

            {/* Add New Profile */}
            <div className="flex items-center gap-2 px-3 py-2 border-t">
              <input
                type="text"
                value={newProfile}
                onChange={(e) => setNewProfile(e.target.value)}
                placeholder="Profile name"
                className="flex-1 border rounded-md px-2 py-1 text-sm"
              />
              <button
                onClick={handleAddProfile}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
