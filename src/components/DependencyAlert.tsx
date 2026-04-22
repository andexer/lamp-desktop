import { Show } from "solid-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { StatusDot } from "~/components/ui/status-dot";

// --- Sub-components ---

const DepStatusRow = (props: { name: string; isInstalled: boolean }) => (
  <div class="flex items-center justify-between p-3.5 rounded-xl border border-primary/5 bg-background/50">
    <span class="font-bold text-sm flex items-center gap-3 text-muted-foreground">
      <Terminal class="h-4 w-4 opacity-50" /> {props.name}
    </span>
    <div class={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
        props.isInstalled 
            ? 'bg-emerald-500/10 text-emerald-500' 
            : 'bg-destructive/10 text-destructive'
    }`}>
      <StatusDot active={props.isInstalled} size="sm" animate={!props.isInstalled} />
      {props.isInstalled ? t("installed") : t("missing")}
    </div>
  </div>
);

// --- Main Component ---

export interface DependencyStatus {
  docker: boolean;
  docker_compose: boolean;
}

interface DependencyAlertProps {
  status: DependencyStatus | null;
  onClose: () => void;
}

export const DependencyAlert = (props: DependencyAlertProps) => {
  const isMissing = () => {
    if (!props.status) return false;
    return !props.status.docker || !props.status.docker_compose;
  };

  const handleOpenDocs = () => {
    openUrl("https://docs.docker.com/engine/install/");
  };

  return (
    <Dialog open={isMissing()} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent class="w-[min(94vw,500px)] max-w-none p-0 overflow-hidden border-destructive/20 bg-card/95 backdrop-blur-3xl shadow-2xl rounded-3xl">
        <DialogHeader class="p-5 pb-0 gap-4 md:p-8 md:pb-0">
          <div class="flex items-center gap-4 text-destructive">
            <div class="p-3 rounded-2xl bg-destructive/10 shadow-inner">
              <AlertTriangle class="h-7 w-7" />
            </div>
            <div>
              <DialogTitle class="text-2xl font-black tracking-tight">{t("missingDeps")}</DialogTitle>
              <DialogDescription class="text-base font-medium opacity-70 mt-1">
                {t("depsDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div class="p-5 space-y-6 md:p-8">
          <div class="space-y-3">
            <DepStatusRow name={t("dockerEngine")} isInstalled={props.status?.docker || false} />
            <DepStatusRow name={t("dockerCompose")} isInstalled={props.status?.docker_compose || false} />
          </div>

          <div class="text-[11px] text-muted-foreground bg-primary/5 p-5 rounded-2xl border border-primary/10 leading-relaxed font-medium">
            <p class="font-black text-primary uppercase tracking-widest mb-2">{t("quickInstall")}</p>
            <p>{t("quickInstallDesc")}</p>
          </div>
        </div>

        <DialogFooter class="p-5 pt-0 flex flex-col gap-4 items-stretch md:p-8 md:pt-0 sm:flex-row sm:justify-between sm:items-center">
          <Button variant="ghost" onClick={props.onClose} class="rounded-2xl px-6 font-bold h-12 order-2 sm:order-1 opacity-60 hover:opacity-100">
            {t("continueAnyway")}
          </Button>
          <Button variant="default" onClick={handleOpenDocs} class="rounded-2xl px-8 h-12 font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 gap-2 order-1 sm:order-2 w-full sm:w-auto">
            <Download class="h-5 w-5" />
            {t("installGuide")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
