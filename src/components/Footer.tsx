import { Show } from "solid-js";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { 
  Play, 
  Square, 
  Globe, 
  Database, 
  Terminal, 
  FolderOpen, 
  ScrollText, 
  Settings2, 
  Trash2 
} from "lucide-solid";
import { t } from "~/i18n";

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
  return (
    <footer class="p-6 bg-background/60 backdrop-blur-xl border-t border-primary/5 flex-none relative z-10">
      <div class="max-w-screen-xl mx-auto flex items-center justify-center gap-4">
        <Button 
          variant={props.isRunning ? "destructive" : "default"}
          onClick={props.toggleAll}
          class="min-w-[160px] h-12 rounded-2xl shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Show when={props.isRunning} fallback={<Play class="mr-3 h-5 w-5 fill-current" />}>
            <Square class="mr-3 h-5 w-5 fill-current" />
          </Show>
          <span class="font-bold text-base">{props.isRunning ? t("stopServer") : t("startAll")}</span>
        </Button>
        
        <Separator orientation="vertical" class="h-10 opacity-10" />

        <div class="flex items-center gap-2 bg-card/50 p-1.5 rounded-2xl border shadow-inner">
          <Button variant="ghost" size="icon" class="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" disabled={!props.config} title={t("webInterface")} onClick={() => props.openUrl(`http://localhost:${props.config?.apache_port}`)}>
            <Globe class="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" class="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" disabled={!props.config} title={t("databaseAdmin")} onClick={() => props.openUrl(`http://localhost:${props.config?.phpmyadmin_port}`)}>
            <Database class="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" class="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" disabled={!props.config} title={t("openTerminal")} onClick={props.openTerminal}>
            <Terminal class="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" class="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" disabled={!props.config} title={t("projectRoot")} onClick={() => props.revealDir(props.config!.project_path)}>
            <FolderOpen class="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" class="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" disabled={!props.config} title={t("systemLogs")} onClick={() => props.setShowLogs(true)}>
            <ScrollText class="h-5 w-5" />
          </Button>
        </div>

        <Separator orientation="vertical" class="h-10 opacity-10" />

        <div class="flex items-center gap-2">
          <Button variant="outline" size="icon" class="h-10 w-10 rounded-xl border-primary/10 text-primary hover:bg-primary/5 transition-all" disabled={!props.config} title={t("settings")} onClick={props.editProject}>
            <Settings2 class="h-5 w-5" />
          </Button>
          
          <Button variant="outline" size="icon" class="h-10 w-10 rounded-xl border-destructive/10 text-destructive hover:bg-destructive/5 transition-all" disabled={!props.config} title={t("deleteStack")} onClick={props.deleteProject}>
            <Trash2 class="h-5 w-5" />
          </Button>
        </div>
      </div>
    </footer>
  );
};
