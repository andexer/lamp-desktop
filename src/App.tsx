import { createSignal, onMount, createEffect } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { revealItemInDir, openUrl } from "@tauri-apps/plugin-opener";

// Components
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { Footer } from "./components/Footer";
import { ProjectWizard } from "./components/ProjectWizard";
import { PhpSettingsDialog } from "./components/PhpSettingsDialog";
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
  working_dir: string | null;
  hostname: string;
  mailpit_port: number;
  php_memory_limit: string;
  php_max_execution_time: number;
  php_upload_max_filesize: string;
  php_post_max_size: string;
  php_display_errors: boolean;
  php_extensions: string[];
}
const DEFAULT_CONFIG: LampConfig = {
    name: "",
    php_version: "8.4",
    apache_port: 80,
    mysql_port: 3306,
    phpmyadmin_port: 8585,
    mailpit_port: 8686,
    mysql_root_password: "root",
    mysql_database: "db",
    mysql_user: "user",
    mysql_password: "pass",
    timezone: "UTC",
    project_path: "",
    working_dir: null,
    hostname: "localhost",
    php_memory_limit: "256M",
    php_max_execution_time: 120,
    php_upload_max_filesize: "64M",
    php_post_max_size: "64M",
    php_display_errors: true,
    php_extensions: ["pdo_mysql", "gd", "intl", "zip"]
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
  const [showPhpSettings, setShowPhpSettings] = createSignal(false);
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
        if (list.includes(selectName)) {
          selectProject(selectName);
        } else {
          setCurrentProject(null);
          setConfig(null);
        }
    } else if (currentProject() && !list.includes(currentProject()!)) {
        setCurrentProject(null);
        setConfig(null);
    } else if (list.length > 0 && !currentProject()) {
        selectProject(list[0]);
    } else if (list.length === 0) {
        setCurrentProject(null);
        setConfig(null);
    }
  };

  const selectProject = async (name: string) => {
    try {
      const cfg = await invoke<LampConfig>("get_project_config", { name });
      setCurrentProject(name);
      setConfig(cfg);
      setShowMenu(false);
      setIsRunning(false); // Reset status for simple UI, could use docker ps check here
    } catch {
      await refreshProjects();
    }
  };

  const handleToggleAll = async () => {
    if (!config()) return;
    try {
      if (!isRunning()) {
        setLogs([]);
        setShowLogs(true);
        await invoke("create_project", { config: config() });
        
        // Register hostname if it's not localhost
        if (config()?.hostname && config()?.hostname !== "localhost") {
            try {
                await invoke("register_hostname", { hostname: config()?.hostname });
            } catch (e) {
                console.warn("Could not register hostname:", e);
            }
        }

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

  const handleSavePhpConfig = async (newConfig: LampConfig) => {
    const updated = await invoke<LampConfig>("save_project_config", { config: newConfig });
    const phpIniContent = await invoke<string>("generate_php_ini_preview", { config: updated });
    await invoke("write_php_ini", { name: updated.name, content: phpIniContent });
    await invoke("create_project", { config: updated });
    setShowPhpSettings(false);
    setConfig(updated);
    // Notify user to restart
    if (isRunning()) {
        alert(t("phpSaveSuccessRestart"));
    }
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
    <div class="flex h-screen min-h-0 flex-col overflow-hidden bg-background text-foreground">
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
        openPhpSettings={() => config() && setShowPhpSettings(true)}
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

      <PhpSettingsDialog 
        show={showPhpSettings()}
        projectName={currentProject()}
        config={config()}
        isRunning={isRunning()}
        onClose={() => setShowPhpSettings(false)}
        onSave={handleSavePhpConfig}
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
