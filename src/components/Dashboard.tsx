import { Show, JSX } from "solid-js";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Plus, Server, Database, Activity, LayoutDashboard } from "lucide-solid";
import { t } from "~/i18n";

import { StatusDot } from "~/components/ui/status-dot";

// --- Sub-components ---

const StatusCard = (props: { label: string; value: string | number; isRunning?: boolean }) => (
  <Card class="bg-card/40 backdrop-blur-sm border-primary/10 transition-all hover:border-primary/20 hover:bg-card/50">
    <CardContent class="p-6 text-center">
      <p class="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">{props.label}</p>
      <div class="flex items-center justify-center gap-3">
        <Show when={props.isRunning !== undefined}>
          <StatusDot active={props.isRunning || false} animate={props.isRunning} size="md" />
        </Show>
        <p class={`text-2xl font-semibold tracking-tight ${props.isRunning === false ? 'text-muted-foreground' : 'text-foreground'}`}>
          {props.value}
        </p>
      </div>
    </CardContent>
  </Card>
);

const ServiceRow = (props: { 
  name: string; 
  description: string; 
  icon: any; 
  isRunning: boolean;
}) => (
  <div class="group flex items-center justify-between p-5 rounded-2xl border border-primary/5 bg-card/20 backdrop-blur-md transition-all hover:bg-card/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary/20">
        <props.icon class="h-6 w-6" />
      </div>
      <div>
          <p class="font-semibold text-lg">{props.name}</p>
          <p class="text-xs text-muted-foreground font-medium">{props.description}</p>
      </div>
    </div>
    <Badge variant={props.isRunning ? "default" : "secondary"} class="rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
      {props.isRunning ? t("online") : t("offline")}
    </Badge>
  </div>
);

const EmptyState = (props: { onNew: () => void }) => (
  <div class="text-center max-w-sm animate-in fade-in zoom-in duration-700">
    <div class="inline-flex p-6 rounded-[2rem] bg-primary/5 mb-8 rotate-12 transition-transform hover:rotate-0">
      <LayoutDashboard class="h-16 w-16 text-primary opacity-40" />
    </div>
    <h2 class="text-4xl font-black text-foreground mb-4 tracking-tight leading-tight">{t("readyToBuild")}</h2>
    <p class="text-muted-foreground mb-10 leading-relaxed font-medium px-4">{t("dashboardDesc")}</p>
    <Button onClick={props.onNew} size="lg" class="rounded-2xl px-10 h-14 text-base font-black shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
        <Plus class="mr-3 h-6 w-6" />
        {t("newProjectStack")}
    </Button>
  </div>
);

// --- Main Component ---

interface DashboardProps {
  currentProject: string | null;
  isRunning: boolean;
  config: any;
  openWizard: () => void;
}

export const Dashboard = (props: DashboardProps) => {
  return (
    <main class="relative grow overflow-auto bg-background p-5 transition-colors duration-300 md:p-8">
      {/* Background Decor */}
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(var(--primary-rgb),0.1),transparent_50%)] pointer-events-none"></div>

      <div class="relative z-10 flex min-h-full items-center justify-center">
      <Show when={props.currentProject} fallback={<EmptyState onNew={props.openWizard} />}>
        <div class="w-full max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 md:space-y-8">
          <div class="grid gap-4 md:grid-cols-2 md:gap-6">
            <StatusCard 
              label={t("engineStatus")} 
              value={props.isRunning ? t("active") : t("standby")} 
              isRunning={props.isRunning} 
            />
            <StatusCard 
              label={t("networkPort")} 
              value={props.config?.apache_port || "---"} 
            />
          </div>

          <div class="space-y-4">
            <ServiceRow 
              name={t("webServer")}
              description={`${t("apache")} ${props.config?.php_version ? `(PHP ${props.config.php_version})` : ''}`}
              icon={Server}
              isRunning={props.isRunning}
            />
            
            <ServiceRow 
              name={t("databaseEngine")}
              description={t("mariaDb")}
              icon={Database}
              isRunning={props.isRunning}
            />

            <ServiceRow 
              name={t("adminInterface")}
              description={t("phpMyAdmin")}
              icon={Activity}
              isRunning={props.isRunning}
            />
          </div>
        </div>
      </Show>
      </div>
    </main>
  );
};
