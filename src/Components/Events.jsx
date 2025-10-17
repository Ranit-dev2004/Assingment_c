import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Users, Clock, FileText, Edit, Globe, X } from "lucide-react";

// 1. IANA Time Zone Mapping for toLocaleString()
const IANA_TIMEZONE_MAP = {
  "UTC": "Etc/UTC",
  "Eastern Time (US & Canada)": "America/New_York",
  "Central Time (US & Canada)": "America/Chicago",
  "Mountain Time (US & Canada)": "America/Denver",
  "Pacific Time (US & Canada)": "America/Los_Angeles",
  "Alaska Time": "America/Anchorage",
  "Hawaii Time": "Pacific/Honolulu",
  "Mexico City": "America/Mexico_City",
  "Bogotá": "America/Bogota",
  "Buenos Aires": "America/Argentina/Buenos_Aires",
  "Santiago": "America/Santiago",
  "São Paulo": "America/Sao_Paulo",
  "London (GMT/BST)": "Europe/London",
  "Paris / Berlin / Rome (CET/CEST)": "Europe/Paris",
  "Istanbul": "Europe/Istanbul",
  "Moscow": "Europe/Moscow",
  "Athens": "Europe/Athens",
  "Warsaw": "Europe/Warsaw",
  "Cairo": "Africa/Cairo",
  "Johannesburg": "Africa/Johannesburg",
  "Nairobi": "Africa/Nairobi",
  "Lagos": "Africa/Lagos",
  "Dubai": "Asia/Dubai",
  "Tehran": "Asia/Tehran",
  "Karachi": "Asia/Karachi",
  "Kathmandu": "Asia/Kathmandu",
  "India Standard Time (IST)": "Asia/Kolkata",
  "Dhaka": "Asia/Dhaka",
  "Bangkok": "Asia/Bangkok",
  "Hong Kong": "Asia/Hong_Kong",
  "Tokyo": "Asia/Tokyo",
  "Seoul": "Asia/Seoul",
  "Jakarta": "Asia/Jakarta",
  "Sydney": "Australia/Sydney",
  "Melbourne": "Australia/Melbourne",
  "Brisbane": "Australia/Brisbane",
  "Adelaide": "Australia/Adelaide",
  "Perth": "Australia/Perth",
  "Auckland": "Pacific/Auckland",
  "Fiji": "Pacific/Fiji",
};

// 2. Updated formatInTimezone function
const formatInTimezone = (date, friendlyTz) => {
  const ianaTz = IANA_TIMEZONE_MAP[friendlyTz] || friendlyTz;

  // Include comprehensive options for consistent formatting (date + time)
  return new Date(date).toLocaleString("en-US", {
    timeZone: ianaTz,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true, // Use AM/PM format
  });
};


const Events = ({ events, onUpdate, currentProfileId }) => {
  const [selectedTimezone, setSelectedTimezone] = useState("UTC");
  const [editingEvent, setEditingEvent] = useState(null);
  const [editData, setEditData] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [logModalEvent, setLogModalEvent] = useState(null);
  const [logs, setLogs] = useState([]);

  const timezones = Object.keys(IANA_TIMEZONE_MAP);

  // ✅ Fetch all profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await axios.get("https://assingment-b.onrender.com/api/profiles");
        setProfiles(res.data);
      } catch (err) {
        console.error("Error fetching profiles:", err);
      }
    };
    fetchProfiles();
  }, []);

  // ✅ Edit event setup
  const handleEdit = (event) => {
    setEditingEvent(event);
    setEditData({
      startDateTime: event.startDateTime.slice(0, 16),
      endDateTime: event.endDateTime.slice(0, 16),
      timezone: event.timezone,
    });
    setSelectedProfiles(event.profiles.map((p) => p._id));
  };

  const handleProfileToggle = (profileId) => {
    setSelectedProfiles((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );
  };

  // ✅ Update event
  const handleUpdate = async () => {
    if (!editingEvent) return;
    try {
      const originalIds = editingEvent.profiles.map((p) => p._id);
      const addProfiles = selectedProfiles.filter((id) => !originalIds.includes(id));
      const removeProfiles = originalIds.filter((id) => !selectedProfiles.includes(id));

      const res = await axios.put(
        `https://assingment-b.onrender.com/api/events/${editingEvent._id}`,
        {
          ...editData,
          addProfiles,
          removeProfiles,
          profileId: currentProfileId,
        }
      );

      if (onUpdate) onUpdate(res.data);
      setEditingEvent(null);
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  // ✅ Fetch logs
  const handleViewLogs = async (eventId) => {
    try {
      const res = await axios.get(`https://assingment-b.onrender.com/api/events/${eventId}/logs`);
      setLogs(res.data);
      setLogModalEvent(eventId);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl mx-auto relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-purple-700">Scheduled Team Events</h2>
        <div className="flex flex-col text-right">
          <span className="text-xs text-gray-500 flex items-center gap-1 justify-end mb-1">
            <Globe className="w-4 h-4" /> Viewing Timezone
          </span>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="mt-1 border border-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 transition duration-150 ease-in-out cursor-pointer"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="p-10 text-center bg-gray-50 rounded-xl">
          <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No events scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="border border-purple-200 bg-purple-50 rounded-xl p-5 hover:shadow-lg transition duration-200 ease-in-out"
            >
              <div className="flex items-center gap-2 text-purple-700 font-semibold text-base mb-2">
                <Users className="w-5 h-5" />
                {event.profiles.map((p) => p.name).join(", ")}
              </div>

              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    <strong>Start:</strong>{" "}
                    {formatInTimezone(event.startDateTime, selectedTimezone)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>
                    <strong>End:</strong>{" "}
                    {formatInTimezone(event.endDateTime, selectedTimezone)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-purple-500 mt-3 font-medium">
                Original Timezone: {event.timezone}
              </p>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-purple-100">
                <button
                  onClick={() => handleEdit(event)}
                  className="flex items-center gap-1 text-xs text-purple-600 border border-purple-300 px-3 py-1 rounded-full bg-white hover:bg-purple-100 transition shadow-sm"
                >
                  <Edit className="w-3 h-3" /> Edit Details
                </button>
                <button
                  onClick={() => handleViewLogs(event._id)}
                  className="flex items-center gap-1 text-xs text-gray-600 border border-gray-300 px-3 py-1 rounded-full bg-white hover:bg-gray-100 transition shadow-sm"
                >
                  <FileText className="w-3 h-3" /> View Logs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative transform scale-100 transition-all duration-300">
            <button
              onClick={() => setEditingEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold mb-5 text-purple-700">Edit Event Details</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Participants</label>
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {profiles.map((p) => (
                    <label
                      key={p._id}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 p-1 rounded-md transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProfiles.includes(p._id)}
                        onChange={() => handleProfileToggle(p._id)}
                        className="form-checkbox h-4 w-4 text-purple-600 rounded"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Original Timezone</label>
                <select
                  value={editData.timezone}
                  onChange={(e) =>
                    setEditData({ ...editData, timezone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={editData.startDateTime}
                  onChange={(e) =>
                    setEditData({ ...editData, startDateTime: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={editData.endDateTime}
                  onChange={(e) =>
                    setEditData({ ...editData, endDateTime: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-full hover:bg-purple-700 transition shadow-md shadow-purple-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {logModalEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => setLogModalEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold mb-4 text-purple-700">Event Logs</h3>

            <div className="flex-grow overflow-y-auto pr-2">
              {logs.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No historical logs found for this event.</p>
              ) : (
                <ul className="space-y-3 text-sm text-gray-700">
                  {logs.map((log, idx) => (
                    <li key={idx} className="border-b border-gray-100 pb-2">
                      <p className="text-gray-900 font-medium">{log.action}</p>
                        <span className="ml-3">
                          ({new Date(log.timestamp).toLocaleString()})
                        </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={() => setLogModalEvent(null)}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100 transition"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
