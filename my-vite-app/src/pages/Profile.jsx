import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/client";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [password, setPassword] = useState({ current_password: "", new_password: "" });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/profile").then((res) => setProfile(res.data)).catch(() => setError("Unable to load profile."));
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      await api.put("/api/profile", profile);
      setMessage("Profile updated.");
      setError("");
    } catch (err) {
      setError("Unable to update profile.");
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    try {
      await api.put("/api/profile/password", password);
      setPassword({ current_password: "", new_password: "" });
      setMessage("Password updated.");
      setError("");
    } catch (err) {
      setError("Unable to update password. Check your current password.");
    }
  };

  const uploadAvatar = async (event) => {
    event.preventDefault();
    if (!avatar) return;
    try {
      const formData = new FormData();
      formData.append("image", avatar);
      const response = await api.post("/api/profile/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setProfile({ ...profile, profile_picture: response.data.profile_picture });
      setMessage("Profile picture uploaded.");
      setError("");
    } catch (err) {
      setError("Unable to upload profile picture.");
    }
  };

  return (
    <AppLayout>
      <div className="op-page-head"><h1>Profile management</h1><p>Update personal details, body stats, fitness goal, and password.</p></div>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {profile && <div className="op-grid op-grid-2">
        <section className="op-card">
          <h2>Edit profile</h2>
          <form className="op-form-grid" onSubmit={saveProfile}>
            {["name", "phone", "height", "weight", "age", "profile_picture"].map((field) => (
              <input key={field} className="form-control" placeholder={field.replace("_", " ")} value={profile[field] || ""} onChange={(e) => setProfile({ ...profile, [field]: e.target.value })} />
            ))}
            <select className="form-select" value={profile.gender || "male"} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
            <select className="form-select" value={profile.goal || "maintain"} onChange={(e) => setProfile({ ...profile, goal: e.target.value })}>
              <option value="lose_weight">Lose weight</option><option value="maintain">Maintain</option><option value="gain_muscle">Gain muscle</option>
            </select>
            <button className="btn btn-success op-span-2">Save profile</button>
          </form>
        </section>
        <section className="op-card">
          <h2>Change password</h2>
          <form className="op-form-grid" onSubmit={changePassword}>
            <input className="form-control op-span-2" type="password" placeholder="Current password" value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} />
            <input className="form-control op-span-2" type="password" placeholder="New password" value={password.new_password} onChange={(e) => setPassword({ ...password, new_password: e.target.value })} />
            <button className="btn btn-dark op-span-2">Update password</button>
          </form>
          <hr />
          <h2>Profile picture</h2>
          {profile.profile_picture ? (
            <img className="op-avatar-preview" src={`${api.defaults.baseURL}${profile.profile_picture}`} alt="Profile" />
          ) : (
            <div className="op-avatar-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          )}
          <form className="op-form-grid" onSubmit={uploadAvatar}>
            <input className="form-control op-span-2" type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
            <button className="btn btn-success op-span-2">Upload picture</button>
          </form>
        </section>
      </div>}
    </AppLayout>
  );
}

export default Profile;
