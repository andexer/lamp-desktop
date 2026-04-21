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

interface NavbarProps {
  currentProject: string | null;
  projects: string[];
  selectProject: (name: string) => void;
  openWizard: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  phpVersion: string | undefined;
}

export const Navbar = (props: NavbarProps) => {
  return (
    <nav class="flex items-center justify-between px-6 h-16 border-b border-primary/5 bg-background/50 backdrop-blur-md flex-none">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 pr-2">
          <div class="bg-primary/10 text-primary p-1.5 rounded-lg">
            <span class="text-xl font-black tracking-tighter leading-none">LAMP</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as={Button} variant="ghost" size="sm" class="rounded-xl px-4 hover:bg-primary/5 transition-all">
            <Menu class="mr-3 h-4 w-4 text-primary" />
            <span class="font-bold tracking-tight uppercase text-xs">{t("projects")}</span>
            <ChevronDown class="ml-2 h-3 w-3 opacity-30" />
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56">
            <DropdownMenuLabel>{t("availableProjects")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div class="max-h-64 overflow-y-auto custom-scrollbar">
                <For each={props.projects}>
                {(p) => (
                    <DropdownMenuItem onClick={() => props.selectProject(p)} class={`flex items-center justify-between ${props.currentProject === p ? "bg-primary/10 text-primary font-bold" : ""}`}>
                    {p}
                    <Show when={props.currentProject === p}>
                        <div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </Show>
                    </DropdownMenuItem>
                )}
                </For>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={props.openWizard} class="text-primary font-bold group">
              <Plus class="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              {t("newProject")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div class="flex items-center gap-3">
            <div class="h-4 w-px bg-primary/10"></div>
            <div class="flex flex-col">
                <span class="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none mb-1">{t("activeEnv")}</span>
                <span class="text-sm font-semibold tracking-tight leading-none">
                    {props.currentProject || t("noneSelected")} 
                    <Show when={props.phpVersion}>
                        <span class="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">PHP {props.phpVersion}</span>
                    </Show>
                </span>
            </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger as={Button} variant="ghost" size="sm" class="rounded-xl px-3 hover:bg-primary/5 transition-all text-xs font-bold uppercase tracking-widest">
            <Globe class="mr-2 h-4 w-4 opacity-50" />
            {locale()}
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-32">
            <DropdownMenuItem onClick={() => setLocale("es")} class={locale() === "es" ? "bg-primary/10 text-primary font-bold" : ""}>
              Español
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale("en")} class={locale() === "en" ? "bg-primary/10 text-primary font-bold" : ""}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale("ru")} class={locale() === "ru" ? "bg-primary/10 text-primary font-bold" : ""}>
              Русский
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale("de")} class={locale() === "de" ? "bg-primary/10 text-primary font-bold" : ""}>
              Deutsch
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale("pt")} class={locale() === "pt" ? "bg-primary/10 text-primary font-bold" : ""}>
              Português
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" class="rounded-xl hover:bg-primary/5 transition-all" onClick={props.toggleTheme}>
          <Show when={props.theme === "light"} fallback={<Sun class="h-5 w-5 text-yellow-500" />}>
            <Moon class="h-5 w-5 text-indigo-500" />
          </Show>
        </Button>
      </div>
    </nav>
  );
};
