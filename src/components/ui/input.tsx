import { type Component, splitProps, type JSX } from "solid-js"
import { cn } from "~/lib/utils"

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  class?: string
}

const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["type", "class"])
  return (
    <input
      type={local.type}
      class={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        local.class
      )}
      {...others}
    />
  )
}

export { Input }
