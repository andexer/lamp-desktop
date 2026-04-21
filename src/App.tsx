import { createSignal, onMount, createEffect } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { revealItemInDir, openUrl } from "@tauri-apps/plugin-opener";

// Components
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { Footer } from "./components/Footer";
import { ProjectWizard } from "./components/ProjectWizard";
import { Console } from "./components/Console";
import { DependencyAlert, type DependencyStatus } from "./components/DependencyAlert";
import { t } from "./i18n";

interface LampConfig {
  name: string;
  php_version: string;
  apache_port: number;
  mysql_port: number;
  phpmyadmin_port: number;
  mysql_root_password: string;
  mysql_database: string;
  mysql_user: string;
  mysql_password: string;
  timezone: string;
  project_path: string;
}

const DEFAULT_CONFIG: LampConfig = {
    name: "",
    php_version: "8.4",
    apache_port: 8080,
    mysql_port: 3307,
    phpmyadmin_port: 8081,
    mysql_root_password: "root",
    mysql_database: "db",
    mysql_user: "user",
    mysql_password: "pass",
    timezone: "UTC",
    project_path: ""
};

function App() {
  const [projects, setProjects] = createSignal<string[]>([]);
  const [currentProject, setCurrentProject] = createSignal<string | null>(null);
  const [config, setConfig] = createSignal<LampConfig | null>(null);
  const [isRunning, setIsRunning] = createSignal<boolean>(false);
  const [showMenu, setShowMenu] = createSignal<boolean>(false);
  const [theme, setTheme] = createSignal<"light" | "dark">("light");

  // Wizard state
  const [showWizard, setShowWizard] = createSignal(false);
  const [isEditing, setIsEditing] = createSignal(false);
  const [wizardConfig, setWizardConfig] = createSignal<LampConfig>(DEFAULT_CONFIG);

  // Logs state
  const [showLogs, setShowLogs] = createSignal(false);
  const [logs, setLogs] = createSignal<string[]>([]);

  // Dependencies state
  const [depStatus, setDepStatus] = createSignal<DependencyStatus | null>({ docker: true, docker_compose: true });

  onMount(async () => {
    const status = await invoke<DependencyStatus>("check_docker");
    setDepStatus(status);

    refreshProjects();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
    }

    listen<string>("docker-log", (event) => {
      setLogs((prev) => [...prev.slice(-200), event.payload]);
    });
  });

  createEffect(() => {
    document.documentElement.setAttribute('data-theme', theme());
  });

  createEffect(() => {
    if (showLogs() && logs().length > 0) {
        setTimeout(() => {
            const el = document.getElementById("logs-end");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 50);
    }
  });

  const refreshProjects = async (selectName?: string) => {
    const list = await invoke<string[]>("list_projects");
    setProjects(list);
    if (selectName) {
        selectProject(selectName);
    } else if (list.length > 0 && !currentProject()) {
        selectProject(list[0]);
    } else if (list.length === 0) {
        setCurrentProject(null);
        setConfig(null);
    }
  };

  const selectProject = async (name: string) => {
    setCurrentProject(name);
    const cfg = await invoke<LampConfig>("get_project_config", { name });
    setConfig(cfg);
    setShowMenu(false);
    setIsRunning(false); // Reset status for simple UI, could use docker ps check here
  };

  const handleToggleAll = async () => {
    if (!config()) return;
    try {
      if (!isRunning()) {
        setLogs([]);
        setShowLogs(true);
        await invoke("create_project", { config: config() });
        const res = await invoke<string>("docker_up", { projectPath: config()?.project_path });
        setIsRunning(true);
        setTimeout(() => setShowLogs(false), 2000);
      } else {
        await invoke("docker_down", { projectPath: config()?.project_path });
        setIsRunning(false);
      }
    } catch (e) {
      alert(`${t("dockerErrorTitle")}:\n${e}`);
    }
  };

  const handleSaveProject = async (newConfig: LampConfig) => {
    const updated = await invoke<LampConfig>("save_project_config", { config: newConfig });
    await invoke("create_project", { config: updated });
    setShowWizard(false);
    refreshProjects(updated.name);
  };

  const handleDeleteProject = async () => {
    if (!currentProject()) return;
    const msg = t("confirmDelete").replace("{name}", currentProject()!);
    if (confirm(msg)) {
        if (isRunning()) await handleToggleAll();
        await invoke("delete_project", { name: currentProject() });
        refreshProjects();
    }
  };

  return (
    <div class="flex flex-col bg-background text-foreground" style="height: 100vh; overflow: hidden;">
      <Navbar 
        currentProject={currentProject()} 
        projects={projects()} 
        showMenu={showMenu()} 
        setShowMenu={setShowMenu}
        selectProject={selectProject}
        openWizard={() => { setIsEditing(false); setWizardConfig(DEFAULT_CONFIG); setShowWizard(true); }}
        theme={theme()}
        toggleTheme={() => setTheme(theme() === "light" ? "dark" : "light")}
        phpVersion={config()?.php_version}
      />

      <Dashboard 
        currentProject={currentProject()} 
        isRunning={isRunning()} 
        config={config()} 
        openWizard={() => { setIsEditing(false); setWizardConfig(DEFAULT_CONFIG); setShowWizard(true); }}
      />

      <Footer 
        config={config()}
        isRunning={isRunning()}
        toggleAll={handleToggleAll}
        openUrl={openUrl}
        openTerminal={() => invoke("open_terminal", { path: config()?.project_path })}
        revealDir={revealItemInDir}
        setShowLogs={setShowLogs}
        editProject={() => { setIsEditing(true); setWizardConfig(config()!); setShowWizard(true); }}
        deleteProject={handleDeleteProject}
      />

      <ProjectWizard 
        show={showWizard()}
        isEditing={isEditing()}
        initialConfig={wizardConfig()}
        onClose={() => setShowWizard(false)}
        onSave={handleSaveProject}
      />

      <Console 
        show={showLogs()} 
        logs={logs()} 
        onClose={() => setShowLogs(false)} 
      />

      <DependencyAlert 
        status={depStatus()} 
        onClose={() => setDepStatus({ docker: true, docker_compose: true })} 
      />
    </div>
  );
}

export default App;
