import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import {
  Activity,
  AlertCircle,
  Check,
  Clock,
  Code2,
  Cpu,
  FileCode2,
  HardDrive,
  Package,
  RefreshCw,
  Save,
  Search,
  Settings2,
  SlidersHorizontal,
} from "lucide-solid";
import { t } from "~/i18n";

import { CustomInput } from "~/components/ui/custom-input";
import { StatusDot } from "~/components/ui/status-dot";

type PhpTab = "basic" | "extensions" | "advanced";

interface ExtensionToggleProps {
  name: string;
  isSelected: boolean;
  onToggle: () => void;
}

interface PhpSettingsDialogProps {
  show: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  config: any;
  projectName: string | null;
  isRunning: boolean;
}

const COMMON_EXTENSIONS = [
  "bcmath", "bz2", "calendar", "ctype", "curl", "dba", "dom", "enchant", "exif", "ffi", "fileinfo",
  "filter", "ftp", "gd", "gettext", "gmp", "hash", "iconv", "imap", "intl", "json", "ldap", "mbstring",
  "mysqli", "oci8", "odbc", "opcache", "pcntl", "pdo", "pdo_dblib", "pdo_firebird", "pdo_mysql",
  "pdo_oci", "pdo_odbc", "pdo_pgsql", "pdo_sqlite", "pgsql", "phar", "posix", "pspell", "readline",
  "reflection", "session", "shmop", "simplexml", "snmp", "soap", "sockets", "sodium", "spl", "sqlite3",
  "standard", "sysvmsg", "sysvsem", "sysvshm", "tidy", "tokenizer", "xml", "xmlreader", "xmlrpc",
  "xmlwriter", "xsl", "zip", "redis", "imagick", "xdebug", "mongodb", "amqp",
].sort();

const ExtensionToggle = (props: ExtensionToggleProps) => (
  <div
    onClick={props.onToggle}
    class={`flex items-center justify-between rounded-2xl border px-4 py-3 transition-all cursor-pointer group ${
      props.isSelected
        ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]"
        : "border-primary/5 bg-background/50 text-muted-foreground hover:bg-muted/40"
    }`}
  >
    <div class="flex items-center gap-3">
      <StatusDot active={props.isSelected} size="sm" animate={props.isSelected} />
      <span class="text-xs font-bold tracking-tight">{props.name}</span>
    </div>
    <Show when={props.isSelected}>
      <Check class="h-3 w-3 animate-in zoom-in duration-300" />
    </Show>
  </div>
);

const EditorPane = (props: {
  value: string;
  onInput: (value: string) => void;
  dirty: boolean;
  loading: boolean;
}) => {
  let gutterRef: HTMLDivElement | undefined;
  let textareaRef: HTMLTextAreaElement | undefined;

  const lineNumbers = createMemo(() => {
    const count = Math.max(props.value.split("\n").length, 1);
    return Array.from({ length: count }, (_, index) => index + 1);
  });

  const syncScroll = () => {
    if (gutterRef && textareaRef) {
      gutterRef.scrollTop = textareaRef.scrollTop;
    }
  };

  return (
    <div class="relative min-h-0 flex-1 overflow-hidden rounded-[24px] border border-primary/10 bg-[#0b1220] shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
      <div class="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.08] text-primary">
            <FileCode2 class="h-4 w-4" />
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-[0.18em] text-primary/85">lamp.ini</p>
            <p class="text-[11px] text-slate-400">{t("phpEditorTitle")}</p>
          </div>
        </div>
        <div class={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
          props.dirty
            ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
            : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
        }`}>
          {props.dirty ? t("phpEditorDirty") : t("phpEditorSynced")}
        </div>
      </div>

      <div class="relative flex h-[340px] min-h-0 md:h-[380px] xl:h-[420px]">
        <div
          ref={gutterRef}
          class="w-14 overflow-hidden border-r border-white/5 bg-black/20 px-3 py-4 text-right font-mono text-xs leading-6 text-slate-500"
        >
          <For each={lineNumbers()}>{(line) => <div>{line}</div>}</For>
        </div>

        <textarea
          ref={textareaRef}
          spellcheck={false}
          value={props.value}
          onInput={(event) => props.onInput(event.currentTarget.value)}
          onScroll={syncScroll}
          class="h-full flex-1 resize-none bg-transparent px-4 py-4 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
          placeholder={props.loading ? t("phpLoadingAdvanced") : t("phpEditorPlaceholder")}
        />
      </div>

      <Show when={props.loading}>
        <div class="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div class="rounded-2xl border border-primary/10 bg-background/80 px-4 py-3 text-sm font-medium text-muted-foreground">
            {t("phpLoadingAdvanced")}
          </div>
        </div>
      </Show>
    </div>
  );
};

export const PhpSettingsDialog = (props: PhpSettingsDialogProps) => {
  const [localConfig, setLocalConfig] = createSignal({ ...(props.config || {}) });
  const [search, setSearch] = createSignal("");
  const [activeTab, setActiveTab] = createSignal<PhpTab>("basic");
  const [advancedContent, setAdvancedContent] = createSignal("");
  const [savedAdvancedContent, setSavedAdvancedContent] = createSignal("");
  const [advancedLoading, setAdvancedLoading] = createSignal(false);
  const [advancedSaving, setAdvancedSaving] = createSignal(false);
  const tabs = createMemo<Array<{ id: PhpTab; label: string; icon: any; desc: string }>>(() => [
    { id: "basic", label: t("phpTabBasic"), icon: SlidersHorizontal, desc: t("phpTabBasicDesc") },
    { id: "extensions", label: t("phpTabExtensions"), icon: Package, desc: t("phpTabExtensionsDesc") },
    { id: "advanced", label: t("phpTabAdvanced"), icon: Code2, desc: t("phpTabAdvancedDesc") },
  ]);

  const filteredExtensions = createMemo(() =>
    COMMON_EXTENSIONS.filter((ext) => ext.toLowerCase().includes(search().toLowerCase()))
  );

  const advancedDirty = createMemo(() => advancedContent() !== savedAdvancedContent());
  const selectedExtensionsCount = createMemo(() => localConfig().php_extensions?.length || 0);

  const toggleExtension = (ext: string) => {
    const current = localConfig().php_extensions || [];
    const updated = current.includes(ext)
      ? current.filter((entry: string) => entry !== ext)
      : [...current, ext];
    setLocalConfig({ ...localConfig(), php_extensions: updated });
  };

  const generatePreview = async (config = localConfig()) =>
    invoke<string>("generate_php_ini_preview", { config });

  const loadAdvancedIni = async (configOverride = localConfig()) => {
    setAdvancedLoading(true);

    try {
      const content = props.projectName
        ? await invoke<string>("read_php_ini", { name: props.projectName })
        : await generatePreview(configOverride);

      setAdvancedContent(content);
      setSavedAdvancedContent(content);
    } catch {
      const fallback = await generatePreview(configOverride);
      setAdvancedContent(fallback);
      setSavedAdvancedContent(fallback);
    } finally {
      setAdvancedLoading(false);
    }
  };

  const reloadAdvancedIni = async () => {
    if (advancedLoading()) return;
    await loadAdvancedIni();
  };

  const restoreFromVisual = async () => {
    const preview = await generatePreview();
    setAdvancedContent(preview);
  };

  const saveAdvancedIni = async () => {
    if (!props.projectName || advancedSaving()) return;

    setAdvancedSaving(true);
    try {
      await invoke("write_php_ini", { name: props.projectName, content: advancedContent() });
      setSavedAdvancedContent(advancedContent());

      if (props.isRunning) {
        alert(t("phpSaveSuccessRestart"));
      }
    } catch (error) {
      alert(`${t("phpSaveIniError")}\n${error}`);
    } finally {
      setAdvancedSaving(false);
    }
  };

  createEffect(() => {
    if (props.show && props.config) {
      const nextConfig = { ...props.config };
      setLocalConfig(nextConfig);
      setSearch("");
      setActiveTab("basic");
      void loadAdvancedIni(nextConfig);
    }
  });

  return (
    <Dialog open={props.show} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent class="inset-0 h-[100dvh] w-[100vw] max-h-none max-w-none overflow-hidden rounded-none border-0 bg-card/98 p-0 shadow-2xl backdrop-blur-3xl">
        <div class="flex h-full min-h-0 flex-col md:flex-row">
          <aside class="flex w-full flex-none flex-row gap-3 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-muted/40 via-muted/20 to-background px-4 py-3 md:w-52 md:min-h-0 md:flex-col md:gap-4 md:overflow-y-auto md:overflow-x-hidden md:border-b-0 md:border-r md:bg-gradient-to-b md:px-4 md:py-4 xl:w-56 xl:px-5">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-inner">
                  <Settings2 class="h-5 w-5" />
                </div>
                <div class="min-w-0">
                  <h2 class="text-lg font-black tracking-tight leading-tight">{t("phpSettings")}</h2>
                  <p class="truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    v{props.config?.php_version || "8.x"}
                  </p>
                </div>
              </div>

              <div class="hidden rounded-3xl border border-primary/10 bg-background/45 p-3.5 md:block">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/85">{t("phpActiveProject")}</p>
                <p class="mt-1.5 truncate text-sm font-bold text-foreground">{props.projectName || t("phpActiveProjectEmpty")}</p>
                <p class="mt-1 text-xs leading-4.5 text-muted-foreground">
                  {t("phpActiveProjectDesc")}
                </p>
              </div>
            </div>

            <nav class="flex min-w-max gap-2 md:min-w-0 md:flex-col md:space-y-1.5">
              <For each={tabs()}>
                {(tab) => (
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    class={`w-[190px] rounded-2xl border px-4 py-3 text-left transition-all md:w-full ${
                      activeTab() === tab.id
                        ? "border-primary/20 bg-primary/[0.08] shadow-[0_12px_40px_rgba(59,130,246,0.18)]"
                        : "border-transparent bg-transparent hover:border-primary/10 hover:bg-background/30"
                    }`}
                  >
                    <div class="flex items-center gap-3">
                      <div class={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                        activeTab() === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground"
                      }`}>
                        <tab.icon class="h-4 w-4" />
                      </div>
                      <div class="min-w-0">
                        <p class={`text-xs font-black uppercase tracking-[0.18em] ${
                          activeTab() === tab.id ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {tab.label}
                        </p>
                        <p class="mt-1 text-xs leading-4.5 text-muted-foreground">{tab.desc}</p>
                      </div>
                    </div>
                  </button>
                )}
              </For>
            </nav>

            <div class="mt-auto hidden rounded-3xl border border-amber-500/15 bg-amber-500/5 p-3.5 md:block">
              <div class="flex items-start gap-3">
                <AlertCircle class="mt-0.5 h-4 w-4 flex-none text-amber-500" />
                <div class="space-y-1.5">
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">{t("phpRestartRequired")}</p>
                  <p class="text-xs leading-4.5 text-amber-100/75">
                    {t("phpRestartHint")}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main class="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
            <header class="border-b border-primary/8 px-4 py-4 md:px-6 md:py-5 xl:px-8">
              <div class="flex items-start justify-between gap-6">
                <div class="space-y-3">
                  <div class="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    <Cpu class="h-3.5 w-3.5" />
                    {t("phpRuntimeBadge")}
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-2xl font-black tracking-tight text-foreground md:text-3xl xl:text-[2.6rem]">
                      {activeTab() === "basic" ? t("phpBasicTitle") : activeTab() === "extensions" ? t("phpExtensionsTitle") : t("phpAdvancedTitle")}
                    </h3>
                    <p class="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                      {activeTab() === "basic"
                        ? t("phpBasicLead")
                        : activeTab() === "extensions"
                          ? t("phpExtensionsLead")
                          : t("phpAdvancedLead")}
                    </p>
                  </div>
                </div>

                <Show when={activeTab() === "advanced"}>
                  <div class="rounded-full border border-primary/10 bg-background/50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    {advancedDirty() ? t("phpEditorModified") : t("phpEditorPristine")}
                  </div>
                </Show>
              </div>
            </header>

            <div class="custom-scrollbar min-h-0 overflow-y-auto px-4 py-4 md:px-6 md:py-5 xl:px-8">
              <Show when={activeTab() === "basic"}>
                <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] xl:gap-5">
                  <section class="space-y-5 rounded-[28px] border border-primary/12 bg-gradient-to-br from-primary/[0.08] via-background to-background/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
                    <div class="space-y-2">
                      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/85">{t("phpRuntimeSection")}</p>
                      <h4 class="text-xl font-black tracking-tight text-foreground">{t("phpRuntimeSectionTitle")}</h4>
                      <p class="max-w-2xl text-sm leading-6 text-muted-foreground">
                        {t("phpRuntimeSectionDesc")}
                      </p>
                    </div>

                    <div class="grid gap-4 lg:grid-cols-2">
                      <CustomInput
                        label={t("memoryLimit")}
                        value={localConfig().php_memory_limit}
                        icon={Activity}
                        class="rounded-2xl border-primary/12 bg-background/65 text-base"
                        onInput={(value) => setLocalConfig({ ...localConfig(), php_memory_limit: value })}
                      />
                      <CustomInput
                        label={t("maxExecutionTime")}
                        value={localConfig().php_max_execution_time}
                        icon={Clock}
                        type="number"
                        class="rounded-2xl border-primary/12 bg-background/65 text-base"
                        onInput={(value) => setLocalConfig({ ...localConfig(), php_max_execution_time: parseInt(value) || 0 })}
                      />
                      <CustomInput
                        label={t("uploadMaxSize")}
                        value={localConfig().php_upload_max_filesize}
                        icon={HardDrive}
                        class="rounded-2xl border-primary/12 bg-background/65 text-base"
                        onInput={(value) => setLocalConfig({ ...localConfig(), php_upload_max_filesize: value })}
                      />
                      <CustomInput
                        label={t("postMaxSize")}
                        value={localConfig().php_post_max_size}
                        icon={HardDrive}
                        class="rounded-2xl border-primary/12 bg-background/65 text-base"
                        onInput={(value) => setLocalConfig({ ...localConfig(), php_post_max_size: value })}
                      />
                    </div>
                  </section>

                  <section class="space-y-4">
                    <div class="rounded-[28px] border border-primary/10 bg-background/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <div class="space-y-3">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/85">{t("phpDiagnostics")}</p>
                        <h4 class="text-lg font-black tracking-tight text-foreground">{t("phpDiagnosticsTitle")}</h4>
                        <p class="text-sm leading-6 text-muted-foreground">
                          {t("phpDiagnosticsDesc")}
                        </p>
                      </div>

                      <div class="mt-5 flex items-center justify-between rounded-2xl border border-primary/8 bg-muted/20 px-4 py-4">
                        <div class="space-y-1">
                          <p class="text-sm font-bold">{t("displayErrors")}</p>
                          <p class="text-xs leading-5 text-muted-foreground">{t("phpDiagnosticsHint")}</p>
                        </div>
                        <input
                          type="checkbox"
                          class="h-5 w-5 cursor-pointer rounded border-primary/20 bg-background text-primary transition-all focus:ring-primary"
                          checked={localConfig().php_display_errors}
                          onChange={(event) => setLocalConfig({ ...localConfig(), php_display_errors: event.currentTarget.checked })}
                        />
                      </div>
                    </div>

                    <div class="rounded-[28px] border border-primary/10 bg-gradient-to-br from-background to-primary/[0.04] p-5">
                      <div class="space-y-3">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/85">{t("phpSummary")}</p>
                        <div class="space-y-2 text-sm">
                          <div class="flex items-center justify-between rounded-2xl bg-background/55 px-4 py-3">
                            <span class="text-muted-foreground">{t("phpVersionLabel")}</span>
                            <span class="font-bold text-foreground">{localConfig().php_version}</span>
                          </div>
                          <div class="flex items-center justify-between rounded-2xl bg-background/55 px-4 py-3">
                            <span class="text-muted-foreground">{t("phpEnabledExtensions")}</span>
                            <span class="font-bold text-foreground">{selectedExtensionsCount()}</span>
                          </div>
                          <div class="flex items-center justify-between rounded-2xl bg-background/55 px-4 py-3">
                            <span class="text-muted-foreground">{t("phpFileMode")}</span>
                            <span class="font-bold text-foreground">lamp.ini</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </Show>

              <Show when={activeTab() === "extensions"}>
                <div class="space-y-6">
                  <section class="flex flex-col gap-4 rounded-[28px] border border-primary/12 bg-gradient-to-br from-primary/[0.06] via-background to-background/95 p-6 xl:flex-row xl:items-end xl:justify-between">
                    <div class="space-y-2">
                      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/85">{t("phpExtensions")}</p>
                      <h4 class="text-xl font-black tracking-tight text-foreground">{t("phpExtensionsCatalog")}</h4>
                      <p class="max-w-2xl text-sm leading-6 text-muted-foreground">
                        {t("phpExtensionsCatalogDesc")}
                      </p>
                    </div>
                    <div class="relative w-full xl:w-72">
                      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                      <Input
                        placeholder={t("phpSearchExtension")}
                        class="h-11 rounded-2xl border-primary/10 bg-background/65 pl-10 pr-4 text-sm"
                        value={search()}
                        onInput={(event) => setSearch(event.currentTarget.value)}
                      />
                    </div>
                  </section>

                  <div class="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                    <For each={filteredExtensions()}>
                      {(ext) => (
                        <ExtensionToggle
                          name={ext}
                          isSelected={localConfig().php_extensions?.includes(ext)}
                          onToggle={() => toggleExtension(ext)}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              <Show when={activeTab() === "advanced"}>
                <div class="grid min-h-full gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <section class="flex min-h-0 flex-col gap-4">
                    <div class="flex flex-wrap items-center gap-3">
                      <Button
                        variant="secondary"
                        class="h-11 rounded-2xl border border-primary/10 bg-primary/10 px-5 font-bold text-foreground hover:bg-primary hover:text-primary-foreground"
                        onClick={restoreFromVisual}
                      >
                        <RefreshCw class="mr-2 h-4 w-4" /> {t("phpRestoreVisual")}
                      </Button>
                      <Button
                        variant="ghost"
                        class="h-11 rounded-2xl border border-primary/10 px-5 font-bold hover:bg-primary/5"
                        onClick={reloadAdvancedIni}
                      >
                        <RefreshCw class="mr-2 h-4 w-4" /> {t("phpReloadFile")}
                      </Button>
                    </div>

                    <EditorPane
                      value={advancedContent()}
                      onInput={(value) => setAdvancedContent(value)}
                      dirty={advancedDirty()}
                      loading={advancedLoading()}
                    />
                  </section>

                  <aside class="space-y-5">
                    <div class="rounded-[28px] border border-primary/10 bg-background/55 p-5">
                      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/85">{t("phpAdvancedFlow")}</p>
                      <div class="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                        <p>{t("phpAdvancedFlowLine1")}</p>
                        <p>{t("phpAdvancedFlowLine2")}</p>
                        <p>{t("phpAdvancedFlowLine3")}</p>
                      </div>
                    </div>

                    <div class="rounded-[28px] border border-primary/10 bg-gradient-to-br from-background to-primary/[0.04] p-5">
                      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/85">{t("phpSuggestions")}</p>
                      <div class="mt-4 space-y-3 font-mono text-xs text-slate-300">
                        <div class="rounded-2xl bg-slate-950/70 px-3 py-2">display_errors = Off</div>
                        <div class="rounded-2xl bg-slate-950/70 px-3 py-2">opcache.enable = 1</div>
                        <div class="rounded-2xl bg-slate-950/70 px-3 py-2">date.timezone = UTC</div>
                      </div>
                    </div>
                  </aside>
                </div>
              </Show>
            </div>

            <footer class="flex flex-none flex-col-reverse gap-3 border-t border-primary/8 bg-card/95 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-5 xl:px-10">
              <Button variant="ghost" onClick={props.onClose} class="h-12 rounded-2xl px-8 font-bold transition-all hover:bg-primary/5">
                {t("back")}
              </Button>

              <div class="flex w-full flex-wrap gap-3 md:w-auto">
                <Show when={activeTab() !== "advanced"} fallback={
                  <Button
                    variant="default"
                    class="h-12 w-full rounded-2xl px-8 font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 md:w-auto"
                    onClick={saveAdvancedIni}
                    disabled={advancedSaving() || advancedLoading() || !props.projectName}
                  >
                    <Save class="mr-2.5 h-4 w-4" /> {advancedSaving() ? t("phpSaving") : t("phpSaveIni")}
                  </Button>
                }>
                  <Button
                    variant="default"
                    class="h-12 w-full rounded-2xl px-10 font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 md:w-auto"
                    onClick={() => props.onSave(localConfig())}
                  >
                    <Check class="mr-3 h-5 w-5" />
                    {t("savePhpConfig")}
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
