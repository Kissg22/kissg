import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Sun,
  Moon,
  Briefcase,
  User,
  Mail,
  Github,
  ExternalLink,
  Search,
  X,
  LayoutGrid,
  List,
  Menu,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ------------------------------------------------------------
// FŐ APP
// ------------------------------------------------------------
export default function App() {
  // --- Téma kezelés (persist + system preferencia) ---
  const getInitialTheme = () => {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // --- Aktív szekció figyelése IntersectionObserver-rel ---
  const [activeSection, setActiveSection] = useState("home");
  const sectionIds = useMemo(() => ["home", "rolam", "projektek", "kapcsolat"], []);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const navbarHeight = 88; // px
    const options: IntersectionObserverInit = {
      // úgy vágjuk meg a root-ot, hogy a sticky navbar-t figyelembe vegyük
      root: null,
      rootMargin: `-${navbarHeight + 4}px 0px -60% 0px`,
      threshold: [0.1, 0.25, 0.5, 0.75, 1],
    };

    observerRef.current = new IntersectionObserver((entries) => {
      // A legnagyobb látható arányú szekció legyen aktív
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
      if (visible[0]?.target?.id) setActiveSection(visible[0].target.id);
    }, options);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sectionIds]);

  // --- Smooth scroll (globális) ---
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `html{scroll-behavior:smooth}`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-500 selection:bg-indigo-500/30">
      <SkipToContent />
      <Navbar theme={theme} toggleTheme={toggleTheme} activeSection={activeSection} />
      <main id="content" className="outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

// ------------------------------------------------------------
// NAVBAR
// ------------------------------------------------------------
const Navbar: React.FC<{
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeSection: string;
}> = ({ theme, toggleTheme, activeSection }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = [
    { id: "home", label: "Kezdőlap" },
    { id: "rolam", label: "Rólam" },
    { id: "projektek", label: "Projektek" },
    { id: "kapcsolat", label: "Kapcsolat" },
  ];

  useEffect(() => {
    // Ha nyitva a mobil menü, ne scrollozzon a háttér
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm dark:shadow-slate-800/50 h-[88px]">
      <div className="container mx-auto px-6 h-full flex justify-between items-center">
        <a href="#home" className="text-2xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-2" aria-label="Ugrás a kezdőlapra">
          <span className="text-indigo-500">{'<'}</span>
          Kiss Gábor
          <span className="text-indigo-500">{' />'}</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-8" aria-label="Fő navigáció">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded ${
                activeSection === item.id
                  ? "text-indigo-500 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400"
              }`}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Téma váltása"
            title="Téma váltása"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Menü megnyitása"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.22 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700"
          >
            <ul className="px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

// ------------------------------------------------------------
// HERO
// ------------------------------------------------------------
const HeroSection: React.FC = () => (
  <section id="home" className="scroll-mt-24 text-center bg-gray-100 dark:bg-slate-900 px-4 pt-20 md:pt-24 pb-20 md:pb-28">
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <img
        src="https://placehold.co/128x128/4338ca/ffffff?text=KG"
        alt="Kiss Gábor profilképe"
        className="rounded-full w-32 h-32 mb-6 shadow-xl border-4 border-indigo-500/50"
        loading="lazy"
        decoding="async"
      />
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4"
      >
        Szia, a nevem <span className="text-indigo-500 dark:text-indigo-400">Kiss Gábor</span>
      </motion.h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
        Szoftverfejlesztő és -tesztelő technikus vagyok, aki a megbízhatóságot és kitartást a sportból hozza a kódolás világába.
      </p>
      <div className="flex justify-center mb-8">
        <a
          href="https://github.com/kissgabor5622"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md border border-gray-200 dark:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Github size={24} />
          <span>GitHub</span>
        </a>
      </div>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <a
          href="#projektek"
          className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full transition-transform duration-300 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Munkáim
        </a>
        <a
          href="#kapcsolat"
          className="w-full sm:w-auto bg-transparent hover:bg-indigo-500 text-indigo-700 dark:text-indigo-400 font-semibold hover:text-white py-3 px-8 border-2 border-indigo-500 hover:border-transparent rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Kapcsolatfelvétel
        </a>
      </div>
    </div>
  </section>
);

// ------------------------------------------------------------
// ABOUT
// ------------------------------------------------------------
const AboutSection: React.FC = () => (
  <section id="rolam" className="scroll-mt-24 py-20 lg:py-32 bg-white dark:bg-slate-800">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
          <User className="mr-3 text-indigo-500" size={32} /> Rólam
        </h2>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Egy kis bemutatkozás a szakmai utamról és a filozófiámról.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
        <div className="lg:col-span-3">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">A történetem</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Kitartó és lelkiismeretes szoftverfejlesztő vagyok, aki széleskörű informatikai tapasztalattal rendelkezik. Célom, hogy a duális képzések és a valós projektek során megszerzett tudásomat kamatoztassam, és hatékony, megbízható szoftvereket hozzak létre. Szeretek csapatban dolgozni és új technológiákat megismerni.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            A mindennapi sportolásból merített kitartásom a munkám során is segít a komplex problémák megoldásában és a minőségi eredmények elérésében.
          </p>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gray-100 dark:bg-slate-700/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Amiben hiszek</h3>
            <ul className="space-y-5">
              {[
                {
                  t: "Automatizálás",
                  d: "Hiszek a hatékony, automatizált rendszerek építésében, amelyek csökkentik a manuális munkát.",
                },
                {
                  t: "Csapatmunka",
                  d: "A legjobb eredményeket szoros együttműködéssel, közös gondolkodással lehet elérni.",
                },
                {
                  t: "Folyamatos tanulás",
                  d: "A technológia világa állandóan változik, a fejlődés kulcsfontosságú.",
                },
              ].map((i) => (
                <li key={i.t} className="flex items-start">
                  <span className="flex-shrink-0 bg-indigo-500 h-2 w-2 rounded-full mr-4 mt-2.5" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>{i.t}:</strong> {i.d}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Főbb technológiáim
        </h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            "HTML/CSS",
            "JavaScript",
            "TypeScript",
            "React",
            "Vue.js",
            "Node.js",
            "PHP",
            ".NET",
            "Flutter",
            "MySQL",
            "PostgreSQL",
            "MongoDB",
            "Shopify",
            "WordPress",
            "Google Cloud",
            "Azure",
            "AWS",
            "Docker",
            "Google Sheets API",
            "Stripe API",
            "REST API",
            "GraphQL",
            "Git",
          ].map((skill) => (
            <span
              key={skill}
              className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 text-sm font-medium px-4 py-2 rounded-md shadow-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ------------------------------------------------------------
// PROJECTS
// ------------------------------------------------------------
const ProjectsSection: React.FC = () => {
  const allProjects = useMemo(
    () => [
      {
        title: "PureLine Webshop",
        description:
          "Duális képzés során készített, teljesen működőképes webáruház. A projekt magában foglalta a frontend és backend fejlesztést, valamint az adatbázis-kezelést.",
        tags: ["PHP", "JavaScript", "MySQL", "Bootstrap"],
        imageUrl: "https://placehold.co/600x400/1e293b/ffffff?text=PureLine+Webshop",
        liveUrl: "https://pureline.infinityfreeapp.com",
        repoUrl: "#",
      },
      {
        title: "IT & Sales Management Rendszer",
        description:
          "A Simple Happy Zrt.-nél fejlesztett rendszer, amely a webshop üzemeltetését és a partneri kapcsolatok kezelését automatizálja API integrációk segítségével.",
        tags: ["API", "Automatizálás", "Webshop"],
        imageUrl: "https://placehold.co/600x400/374151/ffffff?text=IT+System",
        liveUrl: "#",
        repoUrl: "#",
      },
      {
        title: "Cross-Platform Mobilalkalmazás",
        description:
          "Flutter keretrendszerrel fejlesztett koncepcióalkalmazás, amely bemutatja a cross-platform fejlesztési ismereteimet Android és iOS platformokra.",
        tags: ["Flutter", "Mobilalkalmazás", "API"],
        imageUrl: "https://placehold.co/600x400/111827/ffffff?text=Flutter+App",
        liveUrl: "#",
        repoUrl: "#",
      },
    ],
    []
  );

  const allTags = useMemo(() => ["Mind", ...new Set(allProjects.flatMap((p) => p.tags))], [allProjects]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Mind");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const filtered = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return allProjects
      .filter((p) => activeFilter === "Mind" || p.tags.includes(activeFilter))
      .filter((p) => p.title.toLowerCase().includes(t) || p.description.toLowerCase().includes(t));
  }, [searchTerm, activeFilter, allProjects]);

  return (
    <section id="projektek" className="scroll-mt-24 py-20 bg-gray-100 dark:bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
            <Briefcase className="mr-3 text-indigo-500" size={32} /> Munkáim
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Böngéssz a projektjeim között, használj szűrőket vagy keress kulcsszavak alapján.
          </p>
        </div>

        {/* Szűrők, Kereső és Nézetváltó */}
        <div className="mb-8 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Keress projektek között..."
                aria-label="Projekt kereső"
                className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
            <div className="flex-shrink-0 flex items-center justify-end gap-2 bg-gray-200 dark:bg-slate-700 p-1 rounded-lg" role="group" aria-label="Nézetváltó">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  viewMode === "grid" ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-slate-600"
                }`}
                aria-pressed={viewMode === "grid"}
              >
                <LayoutGrid size={16} /> Rács
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  viewMode === "list" ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-slate-600"
                }`}
                aria-pressed={viewMode === "list"}
              >
                <List size={16} /> Lista
              </button>
            </div>
          </div>
          <div className="flex items-center justify-start flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-slate-700/50">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  activeFilter === tag
                    ? "bg-indigo-500 text-white shadow-md"
                    : "bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
                aria-pressed={activeFilter === tag}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Találatok száma */}
        <div className="mb-6 px-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-bold text-gray-800 dark:text-gray-200">{filtered.length}</span> találat
          </p>
        </div>

        {/* Lista */}
        {viewMode === "grid" ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
            {filtered.map((p) => (
              <li key={p.title}>
                <ProjectCard project={p} onSelect={() => setSelectedProject(p)} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-4" role="list">
            {filtered.map((p) => (
              <li key={p.title}>
                <ProjectListItem project={p} onSelect={() => setSelectedProject(p)} />
              </li>
            ))}
          </ul>
        )}

        {filtered.length === 0 && (
          <div className="text-center col-span-full py-16">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Nincs a szűrési feltételeknek megfelelő projekt.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />)
        }
      </AnimatePresence>
    </section>
  );
};

const ProjectTags: React.FC<{ tags: string[] }> = ({ tags }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map((tag) => (
      <span
        key={tag}
        className="bg-indigo-100 dark:bg-slate-700 text-indigo-800 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full"
      >
        {tag}
      </span>
    ))}
  </div>
);

const ProjectCard: React.FC<{ project: any; onSelect: () => void }> = React.memo(
  ({ project, onSelect }) => (
    <button
      onClick={onSelect}
      className="w-full text-left cursor-pointer bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl dark:hover:shadow-indigo-500/20 overflow-hidden transform hover:-translate-y-2 transition-all duration-500 group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label={`${project.title} részletek megnyitása`}
    >
      <div className="overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm flex-grow">
          {project.description.substring(0, 100)}...
        </p>
        <div className="mt-auto">
          <ProjectTags tags={project.tags} />
        </div>
      </div>
    </button>
  )
);

const ProjectListItem: React.FC<{ project: any; onSelect: () => void }> = React.memo(
  ({ project, onSelect }) => (
    <button
      onClick={onSelect}
      className="w-full text-left cursor-pointer bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl dark:hover:bg-slate-700/50 p-4 flex flex-col sm:flex-row items-center gap-6 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label={`${project.title} részletek megnyitása`}
    >
      <img
        src={project.imageUrl}
        alt={project.title}
        className="w-full sm:w-48 h-32 sm:h-28 rounded-lg object-cover"
        loading="lazy"
        decoding="async"
      />
      <div className="flex-grow text-center sm:text-left">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{project.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">{project.description}</p>
        <ProjectTags tags={project.tags} />
      </div>
    </button>
  )
);

// ------------------------------------------------------------
// MODAL (fókuszkezelés + ESC + háttér-scroll lock)
// ------------------------------------------------------------
const ProjectModal: React.FC<{ project: any; onClose: () => void }> = ({ project, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && containerRef.current) {
        // egyszerű fókusz-csapda
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    // háttér scroll tiltás
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // első fókusz
    closeBtnRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="project-title"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
      >
        <div className="relative">
          <img src={project.imageUrl} alt={project.title} className="w-full h-64 object-cover" />
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Bezárás"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          <h2 id="project-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {project.title}
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            <ProjectTags tags={project.tags} />
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{project.description}</p>
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <ExternalLink size={20} /> Élő Demo
            </a>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              <Github size={20} /> Forráskód
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ------------------------------------------------------------
// CONTACT + FOOTER
// ------------------------------------------------------------
const ContactSection: React.FC = () => (
  <section id="kapcsolat" className="scroll-mt-24 py-20 bg-white dark:bg-slate-800">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
        <Mail className="mr-3 text-indigo-500" size={32} /> Lépjünk kapcsolatba!
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        Nyitott vagyok új lehetőségekre. Keress bátran az alábbi email címen!
      </p>
      <a
        href="mailto:kissgabor5622@gmail.com"
        className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xl py-4 px-10 rounded-lg transition-transform hover:scale-105 duration-300 shadow-lg hover:shadow-indigo-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        kissgabor5622@gmail.com
      </a>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="bg-gray-100 dark:bg-slate-900 py-8">
    <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-gray-600 dark:text-gray-400 text-center md:text-left">
        &copy; {new Date().getFullYear()} Kiss Gábor. Minden jog fenntartva.
      </p>
      <div>
        <a
          href="https://github.com/kissgabor5622"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Github size={20} />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </footer>
);

// ------------------------------------------------------------
// Apró kiegészítés: "Ugrás a tartalomra" link a billentyűzethasználóknak
// ------------------------------------------------------------
const SkipToContent: React.FC = () => (
  <a
    href="#content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg"
  >
    Ugrás a tartalomra
  </a>
);
