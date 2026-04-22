import { Show, splitProps, JSX } from "solid-js";
import { Input, type InputProps } from "./input";

interface CustomInputProps extends Omit<InputProps, "onInput"> {
  label?: string;
  icon?: any;
  error?: string;
  suffix?: JSX.Element;
  labelSuffix?: JSX.Element;
  onInput?: (value: string) => void;
}

export const CustomInput = (props: CustomInputProps) => {
  const [local, others] = splitProps(props, ["label", "icon", "error", "class", "suffix", "labelSuffix", "onInput"]);

  return (
    <div class="w-full space-y-3">
      <Show when={local.label}>
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-muted-foreground/85">
            <Show when={local.icon}>
              <local.icon class="h-3.5 w-3.5" />
            </Show>
            <label class="text-[10px] font-black uppercase tracking-[0.2em]">{local.label}</label>
          </div>
          <Show when={local.labelSuffix}>
            {local.labelSuffix}
          </Show>
        </div>
      </Show>

      <div
        class={`w-full ${local.suffix ? "grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" : "block"}`}
      >
        <Input
          {...others}
          onInput={(event) => local.onInput?.(event.currentTarget.value)}
          class={`h-12 w-full rounded-xl border-primary/10 bg-background/55 px-5 font-bold transition-all focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/30 ${local.class || ""}`}
        />
        <Show when={local.suffix}>
          <div class="flex items-center md:self-stretch">{local.suffix}</div>
        </Show>
      </div>

      <Show when={local.error}>
        <p class="text-[10px] text-destructive font-bold ml-1 animate-in fade-in slide-in-from-top-1">
          {local.error}
        </p>
      </Show>
    </div>
  );
};
