"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  title: string;
  prompt: string;
  image_url: string;
  created_at: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  async function loadPosts() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,prompt,image_url,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) setMessage("Could not load gallery. Check your Supabase setup.");
    else setPosts((data ?? []) as Post[]);
  }

  useEffect(() => { void loadPosts(); }, []);

  async function submitPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    if (!supabase) {
      setMessage("Setup needed: add your Supabase URL and public key in .env.local.");
      return;
    }
    if (!file || !title.trim() || !prompt.trim()) {
      setMessage("Please add a title, prompt, and image.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("community-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type
      });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("community-images").getPublicUrl(path);
      const { error: insertError } = await supabase.from("posts").insert({
        title: title.trim(),
        prompt: prompt.trim(),
        image_url: urlData.publicUrl,
        storage_path: path,
        status: "pending"
      });
      if (insertError) throw insertError;

      setTitle("");
      setPrompt("");
      setFile(null);
      const input = document.getElementById("image-file") as HTMLInputElement | null;
      if (input) input.value = "";
      setMessage("Submitted! Your post is pending review before it appears in the public gallery.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed. Please check your setup.");
    } finally {
      setBusy(false);
    }
  }

  const visiblePosts = posts.filter(p =>
    `${p.title} ${p.prompt}`.toLowerCase().includes(search.toLowerCase())
  );

  async function copyPrompt(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage("Prompt copied.");
    } catch {
      setMessage("Copy failed. Select the prompt text and copy it manually.");
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">✦</span> PromptPic Hub</a>
        <a className="nav-link" href="#upload">Share your work</a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">PROMPTS · IMAGES · INSPIRATION</p>
          <h1>Great images start<br /><span>with a great prompt.</span></h1>
          <p className="hero-sub">Explore AI artwork, copy creative prompts, and share your own ideas with the community.</p>
          <a className="primary-btn" href="#gallery">Explore gallery <span>↘</span></a>
        </div>
        <div className="hero-art" aria-label="Decorative sample artwork">
          <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
          <div className="art-card card-back">✺<small>IMAGINE</small></div>
          <div className="art-card card-front"><div className="fake-mountain"></div><div className="fake-sun"></div><small>CREATE SOMETHING NEW</small></div>
          <div className="floating-tag">✦ AI CREATIVE SPACE</div>
        </div>
      </section>

      <section id="upload" className="upload-section">
        <div className="section-heading">
          <div><p className="eyebrow">COMMUNITY UPLOAD</p><h2>Share a prompt + image</h2></div>
          <p className="muted">Uploads are reviewed before they appear publicly.</p>
        </div>
        <form className="upload-form" onSubmit={submitPost}>
          <label>Image title<input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} placeholder="e.g. Dreamy futuristic city" required /></label>
          <label>Your AI prompt<textarea value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={3000} placeholder="Paste the prompt used to create this image..." rows={4} required /></label>
          <label className="file-label">Choose an image<input id="image-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setFile(e.target.files?.[0] ?? null)} required /><span className="file-help">PNG, JPG or WebP · Maximum 5 MB</span></label>
          <button className="primary-btn" type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit for review"} <span>↗</span></button>
          <p className="fine-print">Only upload images you own or have permission to share. Do not upload private, harmful, or copyrighted material without permission.</p>
          {message && <p className="notice" role="status">{message}</p>}
        </form>
      </section>

      <section id="gallery" className="gallery-section">
        <div className="section-heading">
          <div><p className="eyebrow">COMMUNITY PICKS</p><h2>Explore the gallery</h2></div>
          <input className="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search images or prompts..." aria-label="Search gallery" />
        </div>
        {!supabase ? <div className="empty-state"><h3>Gallery setup is next</h3><p>Connect your Supabase project to load approved community images.</p></div> :
          visiblePosts.length === 0 ? <div className="empty-state"><h3>No approved images yet</h3><p>Once an admin approves submissions, they will appear here.</p></div> :
          <div className="gallery-grid">{visiblePosts.map(post => (
            <article className="image-card" key={post.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt={post.title} loading="lazy" />
              <div className="image-card-body">
                <h3>{post.title}</h3><p className="prompt-text">{post.prompt}</p>
                <div className="card-actions">
                  <button className="secondary-btn" onClick={() => void copyPrompt(post.prompt)}>Copy prompt</button>
                  <a className="secondary-btn" href={post.image_url} target="_blank" rel="noreferrer" download>Open / download image</a>
                </div>
              </div>
            </article>
          ))}</div>
        }
      </section>

      <footer><a className="brand" href="#"><span className="brand-mark">✦</span> PromptPic Hub</a><p>Explore responsibly. Share only what you have permission to publish.</p><span>© {new Date().getFullYear()} PromptPic Hub</span></footer>
    </main>
  );
}
