import { Show, JSX } from "solid-js";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { 
  Play, Square, Globe, Database, Terminal, FolderOpen, ScrollText, Settings2, Trash2 
} from "lucide-solid";
import { t } from "~/i18n";

// --- Sub-components ---

interface IconButtonProps {
  icon: any;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "ghost" | "outline";
  danger?: boolean;
}

const IconButton = (props: IconButtonProps) => (
  <Button 
    variant={props.variant || "ghost"} 
    size="icon" 
    class={`h-11 w-11 rounded-2xl transition-all duration-300 ${
      props.danger 
        ? "border-destructive/10 text-destructive hover:bg-destructive/10" 
        : "hover:bg-primary/10 hover:text-primary active:scale-90"
    }`} 
    disabled={props.disabled} 
    title={props.title} 
    onClick={props.onClick}
  >
    <props.icon class="h-5 w-5" />
  </Button>
);

const ProjectControls = (props: { isRunning: boolean; onToggle: () => void; disabled?: boolean }) => (
  <Button 
    variant={props.isRunning ? "destructive" : "default"}
    onClick={props.onToggle}
    disabled={props.disabled}
    class={`min-w-[180px] h-14 rounded-2xl shadow-2xl transition-all hover:scale-[1.03] active:scale-95 group ${
        props.isRunning ? "shadow-destructive/20" : "shadow-primary/20"
    }`}
  >
    <Show when={props.isRunning} fallback={<Play class="mr-3 h-6 w-6 fill-current transition-transform group-hover:scale-110" />}>
      <Square class="mr-3 h-6 w-6 fill-current transition-transform group-hover:rotate-90" />
    </Show>
    <span class="font-black text-base uppercase tracking-wider">
        {props.isRunning ? t("stopServer") : t("startAll")}
    </span>
  </Button>
);

// --- Main Component ---

interface FooterProps {
  config: any;
  isRunning: boolean;
  toggleAll: () => void;
  openUrl: (url: string) => void;
  openTerminal: () => void;
  revealDir: (path: string) => void;
  setShowLogs: (val: boolean) => void;
  editProject: () => void;
  deleteProject: () => void;
}

export const Footer = (props: FooterProps) => {
  const getProjectUrl = () => {
    if (!props.config) return "";
    const host = props.config.hostname && props.config.hostname !== "localhost" ? props.config.hostname : "localhost";
    const port = props.config.apache_port === 80 && host !== "localhost" ? "" : `:${props.config.apache_port}`;
    return `http://${host}${port}`;
  };

  return (
    <footer class="relative z-10 flex-none border-t border-primary/5 bg-background/60 px-4 py-4 backdrop-blur-3xl md:px-6 md:pb-6">
      <div class="mx-auto flex max-w-screen-xl flex-wrap items-center justify-center gap-4 md:gap-6">
        
        <ProjectControls 
          isRunning={props.isRunning} 
          onToggle={props.toggleAll} 
          disabled={!props.config}
        />
        
        <Separator orientation="vertical" class="hidden h-10 opacity-10 xl:block" />

        <div class="flex max-w-full flex-wrap items-center justify-center gap-2.5 bg-card/40 p-2 rounded-[1.5rem] border border-primary/5 shadow-inner backdrop-blur-md">
          <IconButton 
            icon={Globe} 
            title={t("webInterface")} 
            disabled={!props.config}
            onClick={() => props.openUrl(getProjectUrl())}
          />
          
          <IconButton 
            icon={Database} 
            title={t("databaseAdmin")} 
            disabled={!props.config}
            onClick={() => props.openUrl(`http://localhost:${props.config?.phpmyadmin_port}`)}
          />

          <IconButton 
            icon={() => (
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
            )} 
            title={t("mailpitPort")} 
            disabled={!props.config}
            onClick={() => props.openUrl(`http://localhost:${props.config?.mailpit_port}`)}
          />
          
          <IconButton 
            icon={Terminal} 
            title={t("openTerminal")} 
            disabled={!props.config}
            onClick={props.openTerminal}
          />
          
          <IconButton 
            icon={FolderOpen} 
            title={t("projectRoot")} 
            disabled={!props.config}
            onClick={() => props.revealDir(props.config!.project_path)}
          />

          <IconButton 
            icon={ScrollText} 
            title={t("systemLogs")} 
            disabled={!props.config}
            onClick={() => props.setShowLogs(true)}
          />
        </div>

        <Separator orientation="vertical" class="hidden h-10 opacity-10 xl:block" />

        <div class="flex items-center gap-3">
          <IconButton 
            icon={Settings2} 
            title={t("settings")} 
            variant="outline"
            disabled={!props.config}
            onClick={props.editProject}
          />
          
          <IconButton 
            icon={Trash2} 
            title={t("deleteStack")} 
            variant="outline"
            danger
            disabled={!props.config}
            onClick={props.deleteProject}
          />
        </div>
      </div>
    </footer>
  );
};
