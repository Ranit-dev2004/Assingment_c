import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

const timezones = [
    "UTC",
    "Eastern Time (US & Canada)",
    "Central Time (US & Canada)",
    "Mountain Time (US & Canada)",
    "Pacific Time (US & Canada)",
    "Alaska Time",
    "Hawaii Time",
    "Mexico City",
    "Bogotá",
    "Buenos Aires",
    "Santiago",
    "São Paulo",
    "London (GMT/BST)",
    "Paris / Berlin / Rome (CET/CEST)",
    "Istanbul",
    "Moscow",
    "Athens",
    "Warsaw",
    "Cairo",
    "Johannesburg",
    "Nairobi",
    "Lagos",
    "Dubai",
    "Tehran",
    "Karachi",
    "Kathmandu",
    "India Standard Time (IST)",
    "Dhaka",
    "Bangkok",
    "Hong Kong",
    "Tokyo",
    "Seoul",
    "Jakarta",
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Adelaide",
    "Perth",
    "Auckland",
    "Fiji",
  ];

const CreateEvent = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newProfile, setNewProfile] = useState("");
  const [timezone, setTimezone] = useState("Eastern Time (ET)");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // ✅ Fetch profiles from API
  const fetchProfiles = async () => {
    try {
      const res = await axios.get("https://assingment-b.onrender.com//api/profiles");
      setProfiles(res.data);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // ✅ Add new profile
  const handleAddProfile = async () => {
    if (!newProfile.trim()) return alert("Enter profile name");
    try {
      const res = await axios.post("https://assingment-b.onrender.com//api/profiles", {
        name: newProfile.trim(),
        timezone: "UTC",
      });
      setProfiles((prev) => [...prev, res.data]);
      setSelectedProfiles((prev) => [...prev, res.data]);
      setNewProfile("");
      alert("Profile added successfully!");
    } catch (err) {
      console.error("Error adding profile:", err);
      alert("Failed to add profile");
    }
  };

  // ✅ Create event — send multiple users
  const handleCreate = async () => {
  if (
    selectedProfiles.length > 0 &&
    startDate &&
    startTime &&
    endDate &&
    endTime
  ) {
    try {
      const res = await axios.post("https://assingment-b.onrender.com//api/events", {
        profiles: selectedProfiles.map((p) => p._id),
        timezone,
        startDateTime: `${startDate}T${startTime}`, // ✅ Fixed
        endDateTime: `${endDate}T${endTime}`,       // ✅ Fixed
      });
      console.log("Event created:", res.data);
      alert("Event created successfully!");
      setSelectedProfiles([]);
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
    } catch (err) {
      console.error("Error creating event:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to create event");
    }
  } else {
    alert("Please fill all fields");
  }
};


  // ✅ Toggle profile selection (multi-select)
  const toggleProfile = (profile) => {
    setSelectedProfiles((prev) =>
      prev.some((p) => p._id === profile._id)
        ? prev.filter((p) => p._id !== profile._id)
        : [...prev, profile]
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full md:w-1/2 relative">
      <h2 className="text-xl font-semibold mb-4">Create Event</h2>

      {/* Profile Selector */}
      <label className="text-sm text-gray-600 block mb-1">Select Profiles</label>
      <div className="relative mb-4">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full border p-2 rounded-md flex justify-between items-center text-left"
        >
          {selectedProfiles.length > 0
            ? selectedProfiles.map((p) => p.name).join(", ")
            : "Select profiles..."}
          {dropdownOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute mt-1 w-full bg-white border rounded-md shadow-lg z-10 max-h-56 overflow-y-auto">
            {profiles.length > 0 ? (
              profiles.map((p) => {
                const isSelected = selectedProfiles.some(
                  (sp) => sp._id === p._id
                );
                return (
                  <div
                    key={p._id}
                    onClick={() => toggleProfile(p)}
                    className={`px-4 py-2 text-sm flex justify-between items-center cursor-pointer hover:bg-gray-100 ${
                      isSelected
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : ""
                    }`}
                  >
                    {p.name}
                    {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-3">
                No profiles found.
              </p>
            )}

            {/* Inline Add Profile */}
            <div className="border-t px-3 py-2 flex items-center gap-2 bg-gray-50">
              <input
                type="text"
                value={newProfile}
                onChange={(e) => setNewProfile(e.target.value)}
                placeholder="Add new profile"
                className="flex-1 border rounded-md px-2 py-1 text-sm"
              />
              <button
                onClick={handleAddProfile}
                className="bg-purple-600 text-white text-xs px-3 py-1 rounded-md hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timezone Dropdown */}
      <label className="text-sm text-gray-600 block mb-1">Timezone</label>
      <select
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
        className="w-full border p-2 rounded-md mb-4"
      >
        {timezones.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>

      {/* Start Date & Time */}
      <label className="text-sm text-gray-600 block mb-1">
        Start Date & Time
      </label>
      <div className="flex gap-3 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded-md w-1/2"
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="border p-2 rounded-md w-1/2"
        />
      </div>

      {/* End Date & Time */}
      <label className="text-sm text-gray-600 block mb-1">
        End Date & Time
      </label>
      <div className="flex gap-3 mb-6">
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded-md w-1/2"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="border p-2 rounded-md w-1/2"
        />
      </div>

      {/* Create Event Button */}
      <button
        onClick={handleCreate}
        className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
      >
        + Create Event
      </button>
    </div>
  );
};

export default CreateEvent;
