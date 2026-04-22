import { Show } from "solid-js";

interface StatusDotProps {
  active: boolean;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
}

export const StatusDot = (props: StatusDotProps) => {
  const sizeClasses = {
    sm: "h-1.5 w-1.5",
    md: "h-2.5 w-2.5",
    lg: "h-4 w-4"
  };

  return (
    <div class="relative flex items-center justify-center">
      <Show when={props.active && props.animate !== false}>
        <div class={`absolute rounded-full bg-emerald-500 animate-ping opacity-25 ${sizeClasses[props.size || "md"]}`}></div>
      </Show>
      <div class={`rounded-full transition-all duration-500 ${sizeClasses[props.size || "md"]} ${
        props.active 
          ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-110' 
          : 'bg-zinc-600'
      }`}></div>
    </div>
  );
};
