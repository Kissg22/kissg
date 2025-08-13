import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PlusCircle, Trash2, Shield, Lock, Github, ExternalLink } from "lucide-react";

export type Project = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  imageUrl?: string;
  liveUrl?: string; // demo
  repoUrl?: string; // GitHub
  videoUrl?: string; // YouTube vagy MP4/WEBM URL
};

type ProjectsContextType = {
  projects: Project[];
  addProject: (p: Omit<Project, "id">) => void;
  deleteProject: (id: string) => void;
  resetToDefaults: () => void;
};

const ProjectsContext = createContext<ProjectsContextType | null>(null);
export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
};

const LS_KEY = "kg_projects_v1";

const defaultProjects: Project[] = [
  {
    id: cryptoRandomId(),
    title: "PureLine Webshop",
    description:
      "Duális képzés során készített, teljesen működőképes webáruház. A projekt magában foglalta a frontend és backend fejlesztést, valamint az adatbázis-kezelést.",
    tags: ["PHP", "JavaScript", "MySQL", "Bootstrap"],
    imageUrl: "https://placehold.co/600x400/1e293b/ffffff?text=PureLine+Webshop",
    liveUrl: "https://pureline.infinityfreeapp.com",
    repoUrl: "#",
  },
  {
    id: cryptoRandomId(),
    title: "IT & Sales Management Rendszer",
    description:
      "A Simple Happy Zrt.-nél fejlesztett rendszer, amely a webshop üzemeltetését és a partneri kapcsolatok kezelését automatizálja API integrációk segítségével.",
    tags: ["API", "Automatizálás", "Webshop"],
    imageUrl: "https://placehold.co/600x400/374151/ffffff?text=IT+System",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    id: cryptoRandomId(),
    title: "Cross-Platform Mobilalkalmazás",
    description:
      "Flutter keretrendszerrel fejlesztett koncepcióalkalmazás, amely bemutatja a cross-platform fejlesztési ismereteimet Android és iOS platformokra.",
    tags: ["Flutter", "Mobilalkalmazás", "API"],
    imageUrl: "https://placehold.co/600x400/111827/ffffff?text=Flutter+App",
  },
];

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadProjects(): Project[] {
  if (typeof window === "undefined") return defaultProjects;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultProjects;
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(projects));
    } catch {}
  }, [projects]);

  const addProject = useCallback((p: Omit<Project, "id">) => {
    setProjects((prev) => [{ ...p, id: cryptoRandomId() }, ...prev]);
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    setProjects(defaultProjects);
  }, []);

  const value = useMemo(
    () => ({ projects, addProject, deleteProject, resetToDefaults }),
    [projects, addProject, deleteProject, resetToDefaults]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

// ------------------------------------------------------------
// ADMIN FELÜLET (#admin)
// ------------------------------------------------------------
export function AdminPanel({ onExit }: { onExit: () => void }) {
  const { projects, addProject, deleteProject, resetToDefaults } = useProjects();

  // Egyszerű "védés" – csak vizuális: PIN kérése (nem biztonsági megoldás, de elég demohoz)
  const [hasPin, setHasPin] = useState<boolean>(() => localStorage.getItem("kg_admin_pin_ok") === "1");
  const [pin, setPin] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!hasPin) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center gap-3 mb-4 text-indigo-500">
            <Shield /> <Lock />
          </div>
          <h2 className="text-2xl font-bold mb-2">Admin belépés</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Adj meg egy PIN kódot (demo): <span className="font-mono">1234</span>
          </p>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
          />
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                if (pin === "1234") {
                  localStorage.setItem("kg_admin_pin_ok", "1");
                  setHasPin(true);
                }
              }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Belépés
            </button>
            <button onClick={onExit} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700">
              Vissza
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-88px)] container mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold">Admin – Projektek kezelése</h1>
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-slate-700">
            Vissza a honlapra
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("kg_admin_pin_ok");
              window.location.hash = "";
            }}
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600"
          >
            Kilépés
          </button>
        </div>
      </div>

      <AddProjectForm onAdd={addProject} />

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Jelenlegi projektek ({projects.length})</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <li key={p.id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  {p.tags?.length ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{p.tags.join(", ")}</p>
                  ) : null}
                </div>
                <button
                  onClick={() => deleteProject(p.id)}
                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-900/20"
                >
                  <Trash2 size={16} /> Törlés
                </button>
              </div>
              {p.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-3">{p.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {p.repoUrl && (
                  <a href={p.repoUrl} target="_blank" className="text-xs inline-flex items-center gap-1 underline" rel="noreferrer">
                    <Github size={14} /> repo
                  </a>
                )}
                {p.liveUrl && (
                  <a href={p.liveUrl} target="_blank" className="text-xs inline-flex items-center gap-1 underline" rel="noreferrer">
                    <ExternalLink size={14} /> demo
                  </a>
                )}
                {p.videoUrl && <span className="text-xs">🎬 videó</span>}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <button
            onClick={resetToDefaults}
            className="text-sm px-3 py-2 rounded-md bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600"
          >
            Visszaállítás alapértelmezettre
          </button>
        </div>
      </div>
    </div>
  );
}

function AddProjectForm({ onAdd }: { onAdd: (p: Omit<Project, "id">) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const tgs = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tgs,
      imageUrl: imageUrl.trim() || undefined,
      liveUrl: liveUrl.trim() || undefined,
      repoUrl: repoUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    setTags("");
    setImageUrl("");
    setLiveUrl("");
    setRepoUrl("");
    setVideoUrl("");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <PlusCircle className="text-indigo-500" /> Új projekt hozzáadása
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cím *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Címkék (vesszővel elválasztva)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="pl. React, Node.js"
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Leírás</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kép URL</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Demo URL</label>
          <input
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GitHub URL</label>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Videó URL (YouTube / mp4)</label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtu.be/... vagy https://.../video.mp4"
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg">
          Hozzáadás
        </button>
        <span className="text-sm text-gray-500">A mezők opcionálisak (a cím kivételével). Csak a megadott részek fognak megjelenni.</span>
      </div>
    </form>
  );
}
