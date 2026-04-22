import { createSignal, Show, For, createEffect } from "solid-js";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { open } from "@tauri-apps/plugin-dialog";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { 
  Rocket, Network, Settings, Lock, ChevronRight, ChevronLeft, Check, FolderOpen, X, Eye, EyeOff, Database, Sparkles
} from "lucide-solid";
import { t } from "~/i18n";

import { CustomInput } from "~/components/ui/custom-input";

// --- Internal Sub-components ---

const PasswordInput = (props: { 
  label: string; 
  value: string; 
  onInput: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) => (
  <div class="space-y-3">
    <label class="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">{props.label}</label>
    <div class="relative">
        <Input 
            type={props.show ? "text" : "password"} 
            class="h-12 pr-12 rounded-xl font-bold bg-background/50 border-primary/10 focus:border-primary/40 transition-all" 
            value={props.value} 
            onInput={(e) => props.onInput(e.currentTarget.value)} 
        />
        <button 
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors p-1"
            onClick={props.onToggle}
        >
            <Show when={props.show} fallback={<Eye class="h-5 w-5" />}>
                <EyeOff class="h-5 w-5" />
            </Show>
        </button>
    </div>
  </div>
);

const WizardSidebar = (props: { currentStep: number; steps: any[] }) => (
  <div class="flex w-full flex-row gap-3 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-muted/40 via-muted/25 to-background px-4 py-3 flex-none md:w-56 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:bg-gradient-to-b md:px-6 md:py-5 xl:w-60 xl:px-7 xl:py-6">
    <For each={props.steps}>
      {(s) => (
        <div class={`group relative flex min-w-[180px] items-center gap-3 rounded-3xl border px-3 py-3 transition-all duration-300 md:min-w-0 xl:gap-4 xl:px-4 ${
          props.currentStep === s.id
            ? "border-primary/20 bg-primary/[0.08] shadow-[0_12px_40px_rgba(59,130,246,0.18)]"
            : "border-transparent bg-transparent hover:border-primary/10 hover:bg-background/30"
        }`}>
          <div class={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            props.currentStep === s.id ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/30 scale-110' : 
            props.currentStep > s.id ? 'bg-emerald-500/20 text-emerald-500' : 
            'bg-muted/50 text-muted-foreground opacity-40 group-hover:opacity-60'
          }`}>
            <Show when={props.currentStep > s.id} fallback={<s.icon class="h-5 w-5" />}>
              <Check class="h-5 w-5" />
            </Show>
          </div>
          <div class="flex flex-col">
            <span class={`text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 ${props.currentStep === s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {t("stepTitle").replace("{{id}}", s.id.toString()).replace("{id}", s.id.toString())}
            </span>
            <span class={`text-sm font-bold leading-none xl:text-[15px] ${props.currentStep === s.id ? 'text-foreground' : 'text-muted-foreground opacity-60'}`}>{s.title}</span>
          </div>
        </div>
      )}
    </For>
    <div class="hidden md:block md:mt-auto">
        <div class="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-primary/[0.04] to-transparent p-4 backdrop-blur-sm shadow-[0_18px_45px_rgba(37,99,235,0.12)]">
            <p class="text-[10px] text-primary font-black uppercase tracking-widest mb-1.5">{t("architecture")}</p>
            <p class="text-[11px] text-muted-foreground font-medium leading-relaxed">{t("architectureDesc")}</p>
        </div>
    </div>
  </div>
);

// --- Main Component ---

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

const PHP_VERSIONS = ["8.4", "8.3", "8.2", "8.1", "8.0", "7.4"];

export const ProjectWizard = (props: ProjectWizardProps) => {
  const [step, setStep] = createSignal(1);
  const [config, setConfig] = createSignal({...props.initialConfig});
  
  const [showUserPass, setShowUserPass] = createSignal(false);
  const [showRootPass, setShowRootPass] = createSignal(false);

  createEffect(() => {
    if (props.show) {
      setConfig({...props.initialConfig});
      setStep(1);
    }
  });

  createEffect(() => {
    const name = config().name;
    if (name && !props.isEditing && (config().hostname === "localhost" || config().hostname === "" || config().hostname.endsWith(".local"))) {
       const cleanName = name.toLowerCase().replace(/\s+/g, '-').split('.')[0];
       setConfig({...config(), hostname: `${cleanName}.local`});
    }
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const pickDirectory = async () => {
    const selected = await open({ directory: true, multiple: false, title: t("workingDir") });
    if (selected) setConfig({ ...config(), working_dir: selected });
  };

  const projectPath = () => config().working_dir || `~/Documentos/www/${config().name || "..."}`;

  return (
    <Dialog open={props.show} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent class="inset-0 h-[100dvh] w-[100vw] max-h-none max-w-none overflow-hidden rounded-none border-0 bg-card/98 p-0 shadow-2xl backdrop-blur-3xl">
        <div class="flex h-full min-h-0 flex-col md:flex-row">
          <WizardSidebar currentStep={step()} steps={STEPS()} />

          <main class="relative grid min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden px-4 py-4 md:px-6 md:py-6 xl:px-8 xl:py-7">
            <header class="mb-4 flex-none xl:mb-6">
              <Show
                when={step() === 1}
                fallback={
                  <>
                    <h3 class="text-3xl font-black tracking-tight text-foreground mb-2">{STEPS()[step()-1].title}</h3>
                    <p class="text-base text-muted-foreground font-medium">{STEPS()[step()-1].desc}</p>
                  </>
                }
              >
                <div class="space-y-3">
                  <div class="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary shadow-[0_8px_24px_rgba(59,130,246,0.12)]">
                    <Sparkles class="h-3.5 w-3.5" />
                    {t("stepIdentity")}
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-2xl font-black tracking-tight text-foreground md:text-3xl xl:text-[3rem]">{t("wizardIdentityTitle")}</h3>
                    <p class="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                      {t("wizardIdentityLead")}
                    </p>
                  </div>
                </div>
              </Show>
            </header>

            <div class="custom-scrollbar min-h-0 overflow-y-auto pb-6 md:pr-2 md:pb-8">
              <Show when={step() === 1}>
                <div class="animate-in slide-in-from-right-4 duration-300">
                  <section class="relative overflow-hidden rounded-[28px] border border-primary/12 bg-gradient-to-br from-primary/[0.08] via-background to-background/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.35)] md:p-5 xl:p-6">
                    <div class="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full bg-primary/10 blur-3xl"></div>
                    <div class="relative grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-start xl:grid-cols-[250px_minmax(0,1fr)] xl:gap-5">
                      <div class="space-y-4">
                        <div class="flex flex-col items-start justify-between gap-4 xl:block">
                          <div class="space-y-3">
                            <div class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/15 bg-primary/[0.09] text-primary shadow-[0_12px_30px_rgba(59,130,246,0.18)]">
                              <Rocket class="h-5 w-5" />
                            </div>
                            <div class="space-y-2">
                              <h4 class="text-lg font-black tracking-tight text-foreground md:text-xl">{t("wizardProjectBaseTitle")}</h4>
                              <p class="max-w-sm text-sm leading-6 text-muted-foreground">
                                {t("wizardProjectBaseDesc")}
                              </p>
                            </div>
                          </div>
                          <Show when={props.isEditing}>
                            <div class="rounded-full border border-primary/15 bg-background/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                              {t("wizardLocked")}
                            </div>
                          </Show>
                        </div>

                        <div class="rounded-2xl border border-primary/10 bg-background/55 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                          <div class="flex items-start gap-3">
                            <div class="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-primary/12 bg-primary/[0.08] text-primary">
                              <Settings class="h-4 w-4" />
                            </div>
                            <div class="min-w-0 space-y-1">
                              <p class="text-[10px] font-black uppercase tracking-[0.22em] text-primary/80">{t("location")}</p>
                              <p class="text-sm font-medium leading-5 text-muted-foreground">
                                {t("wizardLocationHint")}
                              </p>
                              <p class="break-all text-sm font-bold text-foreground">{projectPath()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="space-y-5 xl:space-y-6">
                        <CustomInput 
                          label={t("projectName")}
                          icon={Rocket}
                          placeholder="e.g. my-laravel-app"
                          disabled={props.isEditing}
                          value={config().name}
                          class="h-14 rounded-2xl border-primary/15 bg-background/70 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] placeholder:text-muted-foreground/55"
                          onInput={(v) => setConfig({...config(), name: v})}
                        />

                        <CustomInput 
                          label={t("workingDir")}
                          icon={FolderOpen}
                          readOnly
                          placeholder={t("defaultDir")}
                          value={config().working_dir || ""}
                          class="h-14 rounded-2xl border-primary/12 bg-background/65 text-sm"
                          labelSuffix={
                            <Show when={config().working_dir}>
                              <Button variant="ghost" size="sm" class="h-7 rounded-full border border-primary/10 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-primary hover:bg-primary/5" onClick={() => setConfig({...config(), working_dir: null})}>
                                <X class="mr-1.5 h-3 w-3" /> {t("defaultDir")}
                              </Button>
                            </Show>
                          }
                          suffix={
                            <Button variant="secondary" class="h-14 rounded-2xl border border-primary/12 bg-primary/10 px-6 font-bold text-foreground shadow-sm transition-all hover:bg-primary hover:text-primary-foreground" onClick={pickDirectory}>
                              <FolderOpen class="mr-2.5 h-4 w-4" /> {t("browse")}
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </Show>

              <Show when={step() === 2}>
                <div class="space-y-5 animate-in slide-in-from-right-4 duration-300 xl:space-y-6">
                  <section class="rounded-[28px] border border-primary/12 bg-gradient-to-br from-primary/[0.06] via-background to-background/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.28)] xl:p-5">
                    <div class="mb-4 flex items-start justify-between gap-4">
                      <div class="space-y-2">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/85">{t("stepNetwork")}</p>
                        <h4 class="text-xl font-black tracking-tight text-foreground">Puertos del stack</h4>
                        <p class="max-w-2xl text-sm leading-6 text-muted-foreground">
                          Organiza los accesos principales del entorno en un solo bloque para detectar conflictos mas rapido.
                        </p>
                      </div>
                    </div>

                    <div class="grid gap-3 md:grid-cols-2 xl:gap-4">
                      <div class="rounded-2xl border border-primary/8 bg-background/45 p-3.5">
                        <CustomInput 
                          type="number" 
                          label={t("apachePort")} 
                          value={config().apache_port} 
                          class="rounded-2xl bg-background/70"
                          onInput={(v) => setConfig({...config(), apache_port: parseInt(v)})} 
                        />
                      </div>
                      <div class="rounded-2xl border border-primary/8 bg-background/45 p-3.5">
                        <CustomInput 
                          type="number" 
                          label={t("mysqlPort")} 
                          value={config().mysql_port} 
                          class="rounded-2xl bg-background/70"
                          onInput={(v) => setConfig({...config(), mysql_port: parseInt(v)})} 
                        />
                      </div>
                      <div class="rounded-2xl border border-primary/8 bg-background/45 p-3.5">
                        <CustomInput 
                          type="number" 
                          label={t("pmaPort")} 
                          value={config().phpmyadmin_port} 
                          class="rounded-2xl bg-background/70"
                          onInput={(v) => setConfig({...config(), phpmyadmin_port: parseInt(v)})} 
                        />
                      </div>
                      <div class="rounded-2xl border border-primary/8 bg-background/45 p-3.5">
                        <CustomInput 
                          type="number" 
                          label={t("mailpitPort")} 
                          value={config().mailpit_port} 
                          class="rounded-2xl bg-background/70"
                          onInput={(v) => setConfig({...config(), mailpit_port: parseInt(v)})} 
                        />
                      </div>
                    </div>
                  </section>

                  <section class="rounded-[28px] border border-primary/10 bg-background/40 p-4 xl:p-5">
                    <div class="mb-3 space-y-2">
                      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/85">{t("hostname")}</p>
                      <p class="max-w-2xl text-sm leading-6 text-muted-foreground">{t("hostnameDesc")}</p>
                    </div>
                    <CustomInput 
                      label={t("hostname")} 
                      placeholder="localhost" 
                      value={config().hostname} 
                      class="rounded-2xl bg-background/70"
                      onInput={(v) => setConfig({...config(), hostname: v})} 
                    />
                  </section>
                </div>
              </Show>

              <Show when={step() === 3}>
                <div class="space-y-6 animate-in slide-in-from-right-4 duration-300 xl:space-y-8">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-muted-foreground/80 ml-1">
                      <Settings class="h-3.5 w-3.5" />
                      <label class="text-[10px] font-black uppercase tracking-[0.2em]">{t("phpEngine")}</label>
                    </div>
                    <select 
                      class="flex h-12 w-full rounded-xl border border-primary/10 bg-background/50 px-5 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all appearance-none cursor-pointer"
                      value={config().php_version} 
                      onChange={(e) => setConfig({...config(), php_version: e.currentTarget.value})}
                    >
                      <For each={PHP_VERSIONS}>
                        {(version) => <option value={version}>{version}</option>}
                      </For>
                    </select>
                  </div>
                  <CustomInput 
                    label={t("mainDatabase")} 
                    icon={Database}
                    value={config().mysql_database} 
                    onInput={(v) => setConfig({...config(), mysql_database: v})} 
                  />
                </div>
              </Show>

              <Show when={step() === 4}>
                <div class="space-y-5 animate-in slide-in-from-right-4 duration-300 xl:space-y-6">
                  <CustomInput 
                    label={t("dbUser")} 
                    icon={Lock}
                    value={config().mysql_user} 
                    onInput={(v) => setConfig({...config(), mysql_user: v})} 
                  />
                  <PasswordInput 
                    label={t("userPass")}
                    value={config().mysql_password}
                    show={showUserPass()}
                    onToggle={() => setShowUserPass(!showUserPass())}
                    onInput={(v) => setConfig({...config(), mysql_password: v})}
                  />
                  <PasswordInput 
                    label={t("rootPass")}
                    value={config().mysql_root_password}
                    show={showRootPass()}
                    onToggle={() => setShowRootPass(!showRootPass())}
                    onInput={(v) => setConfig({...config(), mysql_root_password: v})}
                  />
                </div>
              </Show>
            </div>

            <footer class="-mx-4 flex flex-none flex-col-reverse gap-3 border-t border-primary/8 bg-card/95 px-4 pt-4 md:-mx-6 md:flex-row md:items-center md:justify-between md:px-6 xl:-mx-8 xl:px-8">
              <Button variant="ghost" disabled={step() === 1} onClick={prevStep} class="h-12 rounded-2xl px-8 font-bold transition-all hover:bg-muted/50">
                <ChevronLeft class="mr-2.5 h-5 w-5" /> {t("back")}
              </Button>
              <div class="flex w-full gap-3 md:w-auto md:gap-4">
                <Show when={step() < 4} fallback={
                  <Button variant="default" class="h-12 w-full rounded-2xl px-10 font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 md:w-auto" onClick={() => props.onSave(config())}>
                    <Check class="mr-3 h-5 w-5" /> {props.isEditing ? t("saveStack") : t("buildStack")}
                  </Button>
                }>
                  <Button disabled={!config().name} onClick={nextStep} class="h-12 w-full rounded-2xl px-10 font-black shadow-lg shadow-primary/5 transition-all hover:scale-[1.02] active:scale-95 md:w-auto">
                    {t("next")} <ChevronRight class="ml-3 h-5 w-5" />
                  </Button>
                </Show>
              </div>
            </footer>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
};
