import { For } from "solid-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { t } from "~/i18n";

// --- Sub-components ---

const LogLine = (props: { content: string }) => (
  <div class="group text-zinc-300 py-1 border-l-2 border-transparent hover:border-primary/30 hover:bg-primary/5 px-3 transition-all duration-200">
    <span class="text-zinc-600 mr-3 select-none font-black opacity-50 group-hover:opacity-100 transition-opacity">›</span>
    <span class="leading-relaxed font-medium break-words" style="white-space: pre-wrap;">{props.content}</span>
  </div>
);

// --- Main Component ---

interface ConsoleProps {
  show: boolean;
  onClose: () => void;
  logs: string[];
}

export const Console = (props: ConsoleProps) => {
  return (
    <Dialog open={props.show} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent class="inset-0 flex h-screen w-screen max-h-none max-w-none flex-col overflow-hidden rounded-none border-0 bg-[#0a0a0c] p-0 shadow-2xl">
        <DialogHeader class="p-5 border-b border-zinc-800/50 shrink-0 bg-zinc-900/20 backdrop-blur-md">
          <div class="flex items-center justify-between">
            <DialogTitle class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
              {t("sysConsole")}
            </DialogTitle>
            <div class="flex gap-1.5">
                <div class="h-2 w-2 rounded-full bg-zinc-800"></div>
                <div class="h-2 w-2 rounded-full bg-zinc-800"></div>
                <div class="h-2 w-2 rounded-full bg-zinc-800"></div>
            </div>
          </div>
        </DialogHeader>
        
        <div class="flex-grow overflow-y-auto p-4 font-mono text-[13px] custom-scrollbar bg-[#09090b] selection:bg-primary/30">
          <For each={props.logs}>
            {(line) => <LogLine content={line} />}
          </For>
          <div id="logs-end"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
