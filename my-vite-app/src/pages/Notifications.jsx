import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/client";

function Notifications() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type: "water", title: "", message: "", remind_at: "" });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await api.get("/api/notifications");
      setItems(response.data);
    } catch (err) {
      setError("Unable to load notifications.");
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (event) => {
    event.preventDefault();
    try {
      await api.post("/api/notifications", form);
      setForm({ type: "water", title: "", message: "", remind_at: "" });
      load();
    } catch (err) {
      setError("Unable to create reminder.");
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      load();
    } catch (err) {
      setError("Unable to mark notification as read.");
    }
  };

  return (
    <AppLayout>
      <div className="op-page-head"><h1>Notifications</h1><p>Workout, water, meal, and achievement reminders with read status.</p></div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="op-grid op-grid-2">
        <section className="op-card">
          <h2>Create reminder</h2>
          <form className="op-form-grid" onSubmit={create}>
            <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="water">Water</option><option value="workout">Workout</option><option value="meal">Meal</option><option value="achievement">Achievement</option>
            </select>
            <input className="form-control" type="datetime-local" value={form.remind_at} onChange={(e) => setForm({ ...form, remind_at: e.target.value })} />
            <input className="form-control op-span-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className="form-control op-span-2" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button className="btn btn-success op-span-2">Save reminder</button>
          </form>
        </section>
        <section className="op-card">
          <h2>Reminder center</h2>
          {items.map((item) => (
            <article className={`op-list-item ${item.is_read ? "op-read" : ""}`} key={item.id}>
              <div><strong>{item.title}</strong><p>{item.message}</p><small>{item.type} · {item.remind_at ? String(item.remind_at).slice(0, 16) : "No schedule"}</small></div>
              {!item.is_read && <button className="btn btn-outline-success btn-sm" onClick={() => markRead(item.id)}>Read</button>}
            </article>
          ))}
        </section>
      </div>
    </AppLayout>
  );
}

export default Notifications;
