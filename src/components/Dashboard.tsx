import { Show } from "solid-js";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Plus, Server, Database, Activity, LayoutDashboard } from "lucide-solid";
import { t } from "~/i18n";

interface DashboardProps {
  currentProject: string | null;
  isRunning: boolean;
  config: any;
  openWizard: () => void;
}

export const Dashboard = (props: DashboardProps) => {
  return (
    <main class="grow flex flex-col items-center justify-center p-8 bg-background transition-colors duration-300">
      <Show when={props.currentProject} fallback={
        <div class="text-center max-w-sm animate-in fade-in zoom-in duration-500">
          <div class="inline-flex p-4 rounded-full bg-primary/5 mb-6">
            <LayoutDashboard class="h-12 w-12 text-primary opacity-40" />
          </div>
          <h2 class="text-3xl font-bold text-foreground mb-3 tracking-tight">{t("readyToBuild")}</h2>
          <p class="text-muted-foreground mb-8 leading-relaxed">{t("dashboardDesc")}</p>
          <Button onClick={props.openWizard} size="lg" class="rounded-full px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">
              <Plus class="mr-2 h-5 w-5" />
              {t("newProjectStack")}
          </Button>
        </div>
      }>
        <div class="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="grid grid-cols-2 gap-6">
            <Card class="bg-card/40 backdrop-blur-sm border-primary/10">
              <CardContent class="p-6 text-center">
                <p class="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">{t("engineStatus")}</p>
                <div class="flex items-center justify-center gap-3">
                  <div class={`h-3 w-3 rounded-full transition-all ${props.isRunning ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`}></div>
                  <p class={`text-2xl font-semibold tracking-tight ${props.isRunning ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {props.isRunning ? t("active") : t("standby")}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card class="bg-card/40 backdrop-blur-sm border-primary/10">
              <CardContent class="p-6 text-center">
                <p class="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">{t("networkPort")}</p>
                <p class="text-2xl font-semibold tracking-tight text-foreground">{props.config?.apache_port}</p>
              </CardContent>
            </Card>
          </div>

          <div class="space-y-4">
            <div class="group flex items-center justify-between p-5 rounded-2xl border bg-card/20 backdrop-blur-md transition-all hover:bg-card/40 hover:border-primary/30">
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Server class="h-6 w-6" />
                </div>
                <div>
                    <p class="font-semibold text-lg">{t("webServer")}</p>
                    <p class="text-xs text-muted-foreground">{t("apache")} {props.config?.php_version ? `(PHP ${props.config.php_version})` : ''}</p>
                </div>
              </div>
              <Badge variant={props.isRunning ? "default" : "secondary"} class="rounded-lg px-3 py-1">
                {props.isRunning ? t("online") : t("offline")}
              </Badge>
            </div>
            
            <div class="group flex items-center justify-between p-5 rounded-2xl border bg-card/20 backdrop-blur-md transition-all hover:bg-card/40 hover:border-primary/30">
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Database class="h-6 w-6" />
                </div>
                <div>
                    <p class="font-semibold text-lg">{t("databaseEngine")}</p>
                    <p class="text-xs text-muted-foreground">{t("mariaDb")}</p>
                </div>
              </div>
              <Badge variant={props.isRunning ? "default" : "secondary"} class="rounded-lg px-3 py-1">
                {props.isRunning ? t("online") : t("offline")}
              </Badge>
            </div>

            <div class="group flex items-center justify-between p-5 rounded-2xl border bg-card/20 backdrop-blur-md transition-all hover:bg-card/40 hover:border-primary/30">
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Activity class="h-6 w-6" />
                </div>
                <div>
                    <p class="font-semibold text-lg">{t("adminInterface")}</p>
                    <p class="text-xs text-muted-foreground">{t("phpMyAdmin")}</p>
                </div>
              </div>
              <Badge variant={props.isRunning ? "default" : "secondary"} class="rounded-lg px-3 py-1">
                {props.isRunning ? t("online") : t("offline")}
              </Badge>
            </div>
          </div>
        </div>
      </Show>
    </main>
  );
};
