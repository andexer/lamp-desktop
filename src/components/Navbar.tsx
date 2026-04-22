import { For, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Menu, Moon, Sun, Plus, ChevronDown, Globe } from "lucide-solid";
import { t, locale, setLocale, Locale } from "~/i18n";

// --- Sub-components ---

const Logo = () => (
  <div class="flex items-center gap-2 pr-2">
    <div class="bg-primary/10 text-primary p-1.5 rounded-lg shadow-inner">
      <span class="text-xl font-black tracking-tighter leading-none">LAMP</span>
    </div>
  </div>
);

const ProjectSelector = (props: { projects: string[]; current: string | null; onSelect: (p: string) => void; onNew: () => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger as={Button} variant="ghost" size="sm" class="rounded-xl px-4 hover:bg-primary/5 transition-all focus:ring-0">
      <Menu class="mr-3 h-4 w-4 text-primary" />
      <span class="font-bold tracking-tight uppercase text-xs">{t("projects")}</span>
      <ChevronDown class="ml-2 h-3 w-3 opacity-30" />
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-64 p-1.5 rounded-2xl border-primary/10 shadow-2xl backdrop-blur-xl">
      <DropdownMenuLabel class="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-3 py-2">{t("availableProjects")}</DropdownMenuLabel>
      <DropdownMenuSeparator class="opacity-5" />
      <div class="max-h-64 overflow-y-auto custom-scrollbar p-1">
          <For each={props.projects}>
          {(p) => (
              <DropdownMenuItem onClick={() => props.onSelect(p)} class={`flex items-center justify-between rounded-xl px-3 py-2 transition-all ${props.current === p ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20" : "hover:bg-primary/5"}`}>
                <span class="text-sm">{p}</span>
                <Show when={props.current === p}>
                    <div class="h-1.5 w-1.5 rounded-full bg-primary-foreground"></div>
                </Show>
              </DropdownMenuItem>
          )}
          </For>
      </div>
      <DropdownMenuSeparator class="opacity-5" />
      <DropdownMenuItem onClick={props.onNew} class="text-primary font-bold group rounded-xl px-3 py-2.5 mt-1 hover:bg-primary/5">
        <Plus class="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
        <span class="text-xs uppercase tracking-wider">{t("newProject")}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const LanguageSelector = () => (
  <DropdownMenu>
    <DropdownMenuTrigger as={Button} variant="ghost" size="sm" class="rounded-xl px-3 hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-[0.15em] opacity-70 hover:opacity-100">
      <Globe class="mr-2 h-4 w-4 opacity-50" />
      {locale()}
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-40 p-1.5 rounded-2xl border-primary/10 shadow-2xl">
      <For each={["en", "es", "ru", "de", "pt"]}>
        {(lang) => (
          <DropdownMenuItem 
            onClick={() => setLocale(lang as Locale)} 
            class={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${locale() === lang ? "bg-primary/10 text-primary" : "hover:bg-primary/5"}`}
          >
            {lang === "en" ? "English" : lang === "es" ? "Español" : lang === "ru" ? "Русский" : lang === "de" ? "Deutsch" : "Português"}
          </DropdownMenuItem>
        )}
      </For>
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- Main Component ---

interface NavbarProps {
  currentProject: string | null;
  projects: string[];
  selectProject: (name: string) => void;
  openWizard: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  phpVersion: string | undefined;
  openPhpSettings: () => void;
}

export const Navbar = (props: NavbarProps) => {
  return (
    <nav class="flex flex-wrap items-center justify-between gap-3 border-b border-primary/5 bg-background/50 px-4 py-3 backdrop-blur-md flex-none md:px-6">
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3 md:gap-6">
        <Logo />
        <ProjectSelector 
          projects={props.projects} 
          current={props.currentProject} 
          onSelect={props.selectProject} 
          onNew={props.openWizard} 
        />
        
        <div class="flex min-w-0 items-center gap-3">
            <div class="hidden h-4 w-px bg-primary/10 md:block"></div>
            <div class="flex min-w-0 flex-col">
                <span class="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black leading-none mb-1.5">{t("activeEnv")}</span>
                <span class="flex min-w-0 flex-wrap items-center gap-2 text-sm font-bold tracking-tight leading-none">
                    <span class="max-w-[180px] truncate md:max-w-[240px]">{props.currentProject || t("noneSelected")}</span>
                    <Show when={props.phpVersion}>
                        <button 
                            onClick={props.openPhpSettings}
                            class="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase hover:bg-primary/20 transition-all cursor-pointer font-black border border-primary/10 shadow-sm"
                        >
                            PHP {props.phpVersion}
                        </button>
                    </Show>
                </span>
            </div>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start md:self-auto">
        <LanguageSelector />

        <Button variant="ghost" size="icon" class="rounded-xl hover:bg-primary/5 transition-all" onClick={props.toggleTheme}>
          <Show when={props.theme === "light"} fallback={<Sun class="h-5 w-5 text-yellow-500 animate-in zoom-in spin-in-90 duration-500" />}>
            <Moon class="h-5 w-5 text-indigo-500 animate-in zoom-in spin-in-90 duration-500" />
          </Show>
        </Button>
      </div>
    </nav>
  );
};
