import { createSignal, Show, For } from "solid-js";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { 
  Rocket, 
  Network, 
  Settings, 
  Lock, 
  ChevronRight, 
  ChevronLeft, 
  Check 
} from "lucide-solid";
import { t } from "~/i18n";

interface ProjectWizardProps {
  show: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  initialConfig: any;
  isEditing: boolean;
}

const STEPS = () => [
  { id: 1, title: t("stepIdentity"), icon: Rocket, desc: t("stepIdentityDesc") },
  { id: 2, title: t("stepNetwork"), icon: Network, desc: t("stepNetworkDesc") },
  { id: 3, title: t("stepEnv"), icon: Settings, desc: t("stepEnvDesc") },
  { id: 4, title: t("stepSecurity"), icon: Lock, desc: t("stepSecurityDesc") }
];

export const ProjectWizard = (props: ProjectWizardProps) => {
  const [step, setStep] = createSignal(1);
  const [config, setConfig] = createSignal({...props.initialConfig});

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <Dialog open={props.show} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent class="sm:max-w-[600px] p-0 overflow-hidden border-primary/10 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <div class="flex h-[450px]">
          {/* Sidebar Steps */}
          <div class="w-48 bg-muted/30 border-r border-primary/5 p-6 flex flex-col gap-6">
            <For each={STEPS()}>
              {(s) => (
                <div class="flex items-center gap-3 group transition-all">
                  <div class={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                    step() === s.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110' : 
                    step() > s.id ? 'bg-emerald-500/20 text-emerald-500' : 
                    'bg-muted text-muted-foreground opacity-50'
                  }`}>
                    <Show when={step() > s.id} fallback={<s.icon class="h-4 w-4" />}>
                      <Check class="h-4 w-4" />
                    </Show>
                  </div>
                  <div class="flex flex-col">
                    <span class={`text-[10px] font-bold uppercase tracking-widest leading-none mb-1 ${step() === s.id ? 'text-primary' : 'text-muted-foreground'}`}>{t("stepTitle", { id: s.id.toString() })}</span>
                    <span class={`text-xs font-semibold leading-none ${step() === s.id ? 'text-foreground' : 'text-muted-foreground opacity-70'}`}>{s.title}</span>
                  </div>
                </div>
              )}
            </For>
            <div class="mt-auto">
                <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p class="text-[9px] text-primary font-bold uppercase tracking-tighter mb-1">{t("architecture")}</p>
                    <p class="text-[10px] text-muted-foreground leading-tight">{t("architectureDesc")} {config().php_version}</p>
                </div>
            </div>
          </div>

          {/* Main Content */}
          <div class="flex-grow flex flex-col p-8">
            <header class="mb-8">
              <h3 class="text-2xl font-bold tracking-tight text-foreground">{STEPS()[step()-1].title}</h3>
              <p class="text-sm text-muted-foreground">{STEPS()[step()-1].desc}</p>
            </header>

            <div class="flex-grow animate-in fade-in slide-in-from-right-4 duration-300">
              <Show when={step() === 1}>
                <div class="space-y-6">
                  <div class="space-y-3">
                    <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("projectName")}</label>
                    <Input 
                        class="h-12 bg-background/50 border-primary/10 focus:border-primary/30 transition-all text-lg font-medium"
                        placeholder="e.g. my-laravel-app" 
                        disabled={props.isEditing}
                        value={config().name} 
                        onInput={(e) => setConfig({...config(), name: e.currentTarget.value})} 
                    />
                    <div class="p-3 rounded-lg bg-muted/50 border border-primary/5">
                        <p class="text-[10px] text-muted-foreground leading-relaxed">
                            <span class="text-primary font-bold">{t("location")}:</span> ~/Documentos/www/{config().name || '...'}<br/>
                            <span class="text-primary font-bold">{t("config")}:</span> ~/.lamp-desktop/projects/{config().name || '...'}
                        </p>
                    </div>
                  </div>
                </div>
              </Show>

              <Show when={step() === 2}>
                <div class="space-y-6">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("apachePort")}</label>
                      <Input type="number" class="h-11" value={config().apache_port} onInput={(e) => setConfig({...config(), apache_port: parseInt(e.currentTarget.value)})} />
                    </div>
                    <div class="space-y-2">
                      <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("mysqlPort")}</label>
                      <Input type="number" class="h-11" value={config().mysql_port} onInput={(e) => setConfig({...config(), mysql_port: parseInt(e.currentTarget.value)})} />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pmaPort")}</label>
                    <Input type="number" class="h-11" value={config().phpmyadmin_port} onInput={(e) => setConfig({...config(), phpmyadmin_port: parseInt(e.currentTarget.value)})} />
                  </div>
                </div>
              </Show>

              <Show when={step() === 3}>
                <div class="space-y-6">
                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("phpEngine")}</label>
                    <select 
                      class="flex h-12 w-full rounded-xl border border-primary/10 bg-background/50 px-4 py-2 text-base font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all appearance-none"
                      value={config().php_version} 
                      onChange={(e) => setConfig({...config(), php_version: e.currentTarget.value})}
                    >
                      <option>8.4</option><option>8.3</option><option>8.2</option><option>8.1</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("mainDatabase")}</label>
                    <Input type="text" class="h-11" value={config().mysql_database} onInput={(e) => setConfig({...config(), mysql_database: e.currentTarget.value})} />
                  </div>
                </div>
              </Show>

              <Show when={step() === 4}>
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("dbUser")}</label>
                    <Input type="text" class="h-11" value={config().mysql_user} onInput={(e) => setConfig({...config(), mysql_user: e.currentTarget.value})} />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("userPass")}</label>
                    <Input type="password" class="h-11" value={config().mysql_password} onInput={(e) => setConfig({...config(), mysql_password: e.currentTarget.value})} />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("rootPass")}</label>
                    <Input type="password" class="h-11" value={config().mysql_root_password} onInput={(e) => setConfig({...config(), mysql_root_password: e.currentTarget.value})} />
                  </div>
                </div>
              </Show>
            </div>

            <footer class="flex justify-between mt-auto pt-6 border-t border-primary/5">
              <Button variant="ghost" disabled={step() === 1} onClick={prevStep} class="rounded-xl px-6">
                <ChevronLeft class="mr-2 h-4 w-4" />
                {t("back")}
              </Button>
              <div class="flex gap-2">
                <Show when={step() < 4} fallback={
                  <Button variant="default" class="rounded-xl px-8 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95" onClick={() => props.onSave(config())}>
                    <Check class="mr-2 h-4 w-4" />
                    {props.isEditing ? t("saveStack") : t("buildStack")}
                  </Button>
                }>
                  <Button disabled={!config().name} onClick={nextStep} class="rounded-xl px-8 font-bold transition-all active:scale-95">
                    {t("next")}
                    <ChevronRight class="ml-2 h-4 w-4" />
                  </Button>
                </Show>
              </div>
            </footer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
