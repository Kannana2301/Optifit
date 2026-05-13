import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import SimpleChart from "../components/SimpleChart";
import api from "../api/client";

function Progress() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ tracked_on: new Date().toISOString().slice(0, 10), weight: "", chest: "", waist: "", hips: "", calories_burned: "", before_image: "", after_image: "", notes: "" });
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState({});

  const load = async () => {
    try {
      const response = await api.get("/api/progress");
      setEntries(response.data);
    } catch (err) {
      setError("Unable to load progress entries.");
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      await api.post("/api/progress", form);
      setForm({ ...form, weight: "", chest: "", waist: "", hips: "", calories_burned: "", notes: "" });
      load();
    } catch (err) {
      setError("Unable to save progress.");
    }
  };

  const chartData = [...entries].reverse().map((entry) => ({ date: entry.tracked_on, weight: entry.weight }));

  const uploadImage = async (entry, imageType) => {
    const file = uploads[`${entry.id}-${imageType}`];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("progress_id", entry.id);
      formData.append("image_type", imageType);
      await api.post("/api/progress/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
      load();
    } catch (err) {
      setError("Unable to upload progress image.");
    }
  };

  return (
    <AppLayout>
      <div className="op-page-head"><h1>Progress tracking</h1><p>Record weight, measurements, calories burned, photos, and timeline notes.</p></div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="op-grid op-grid-2">
        <section className="op-card">
          <h2>Weight analytics</h2>
          <SimpleChart data={chartData.length ? chartData : [{ date: "Start", weight: 0 }]} />
        </section>
        <section className="op-card">
          <h2>Add progress</h2>
          <form className="op-form-grid" onSubmit={save}>
            {["tracked_on", "weight", "chest", "waist", "hips", "calories_burned"].map((field) => (
              <input key={field} className="form-control" type={field === "tracked_on" ? "date" : "number"} placeholder={field.replace("_", " ")} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            ))}
            <input className="form-control" placeholder="Before image URL" value={form.before_image} onChange={(e) => setForm({ ...form, before_image: e.target.value })} />
            <input className="form-control" placeholder="After image URL" value={form.after_image} onChange={(e) => setForm({ ...form, after_image: e.target.value })} />
            <textarea className="form-control op-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="btn btn-success op-span-2">Save progress</button>
          </form>
        </section>
      </div>
      <section className="op-card mt-4">
        <h2>Historical timeline</h2>
        {entries.map((entry) => (
          <article className="op-timeline" key={entry.id}>
            <strong>{String(entry.tracked_on).slice(0, 10)}</strong>
            <span>{entry.weight || "-"} kg · Waist {entry.waist || "-"} cm · {entry.calories_burned} kcal burned</span>
            <p>{entry.notes}</p>
            {(entry.before_image || entry.after_image) && (
              <div className="op-img-row">
                {entry.before_image && (
                  <div>
                    <small>Before</small>
                    <img className="op-img-progress" src={entry.before_image.startsWith("http") ? entry.before_image : `${api.defaults.baseURL}${entry.before_image}`} alt="Before" loading="lazy" onError={(e) => { e.target.style.display = "none"; }} />
                  </div>
                )}
                {entry.after_image && (
                  <div>
                    <small>After</small>
                    <img className="op-img-progress" src={entry.after_image.startsWith("http") ? entry.after_image : `${api.defaults.baseURL}${entry.after_image}`} alt="After" loading="lazy" onError={(e) => { e.target.style.display = "none"; }} />
                  </div>
                )}
              </div>
            )}
            <div className="op-upload-row">
              <input className="form-control" type="file" accept="image/*" onChange={(e) => setUploads({ ...uploads, [`${entry.id}-before`]: e.target.files?.[0] })} />
              <button className="btn btn-outline-success btn-sm" onClick={() => uploadImage(entry, "before")}>Upload before</button>
              <input className="form-control" type="file" accept="image/*" onChange={(e) => setUploads({ ...uploads, [`${entry.id}-after`]: e.target.files?.[0] })} />
              <button className="btn btn-outline-success btn-sm" onClick={() => uploadImage(entry, "after")}>Upload after</button>
            </div>
          </article>
        ))}
      </section>
    </AppLayout>
  );
}

export default Progress;
