import { type Component, splitProps } from "solid-js"
import { DropdownMenu as DropdownMenuPrimitive } from "@kobalte/core/dropdown-menu"
import { cn } from "~/lib/utils"

const DropdownMenu = DropdownMenuPrimitive
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuContent: Component<any> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        class={cn(
          "z-50 min-width-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          local.class
        )}
        {...others}
      />
    </DropdownMenuPortal>
  )
}

const DropdownMenuItem: Component<any> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <DropdownMenuPrimitive.Item
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        local.class
      )}
      {...others}
    />
  )
}

const DropdownMenuSeparator: Component<any> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <DropdownMenuPrimitive.Separator
      class={cn("-mx-1 my-1 h-px bg-muted", local.class)}
      {...others}
    />
  )
}

const DropdownMenuLabel: Component<any> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <div class={cn("px-2 py-1.5 text-sm font-semibold", local.class)} {...others} />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
}
