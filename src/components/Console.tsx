import { For } from "solid-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { t } from "~/i18n";

interface ConsoleProps {
  show: boolean;
  onClose: () => void;
  logs: string[];
}

export const Console = (props: ConsoleProps) => {
  return (
    <Dialog open={props.show} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent class="sm:max-w-[800px] h-[600px] flex flex-col p-0 overflow-hidden bg-black border-zinc-800">
        <DialogHeader class="p-4 border-b border-zinc-800 shrink-0">
          <DialogTitle class="text-zinc-400 text-xs font-mono uppercase tracking-widest">
            {t("sysConsole")}
          </DialogTitle>
        </DialogHeader>
        
        <div class="flex-grow overflow-y-auto p-4 font-mono text-sm custom-scrollbar bg-[#09090b]">
          <For each={props.logs}>
            {(line) => (
              <div class="text-zinc-300 py-0.5 border-l-2 border-transparent hover:border-zinc-800 hover:bg-white/5 px-2 transition-colors">
                <span class="text-zinc-600 mr-2 select-none">$</span>
                <span style="white-space: pre-wrap; line-height: 1.6;">{line}</span>
              </div>
            )}
          </For>
          <div id="logs-end"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
