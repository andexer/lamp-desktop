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
import { AlertTriangle, Download, Terminal } from "lucide-solid";
import { openUrl } from "@tauri-apps/plugin-opener";
import { t } from "~/i18n";

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
      <DialogContent class="sm:max-w-[500px] border-destructive/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader class="gap-2">
          <div class="flex items-center gap-3 text-destructive">
            <div class="p-2 rounded-full bg-destructive/10">
              <AlertTriangle class="h-6 w-6" />
            </div>
            <DialogTitle class="text-xl">{t("missingDeps")}</DialogTitle>
          </div>
          <DialogDescription class="text-base mt-2">
            {t("depsDesc")}
          </DialogDescription>
        </DialogHeader>

        <div class="py-4 space-y-4">
          <div class="p-4 rounded-xl border bg-muted/30 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-medium flex items-center gap-2">
                <Terminal class="h-4 w-4" /> {t("dockerEngine")}
              </span>
              <span class={`text-sm font-bold px-2 py-0.5 rounded ${props.status?.docker ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                {props.status?.docker ? t("installed") : t("missing")}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium flex items-center gap-2">
                <Terminal class="h-4 w-4" /> {t("dockerCompose")}
              </span>
              <span class={`text-sm font-bold px-2 py-0.5 rounded ${props.status?.docker_compose ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                {props.status?.docker_compose ? t("installed") : t("missing")}
              </span>
            </div>
          </div>

          <div class="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
            <p class="font-semibold text-foreground mb-1">{t("quickInstall")}</p>
            <p>{t("quickInstallDesc")}</p>
          </div>
        </div>

        <DialogFooter class="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button variant="outline" onClick={props.onClose}>
            {t("continueAnyway")}
          </Button>
          <Button variant="default" onClick={handleOpenDocs} class="gap-2 shadow-lg shadow-primary/20">
            <Download class="h-4 w-4" />
            {t("installGuide")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
