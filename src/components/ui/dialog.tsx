import { type Component, splitProps } from "solid-js"
import { Dialog as DialogPrimitive } from "@kobalte/core/dialog"
import { cn } from "~/lib/utils"

const Dialog = DialogPrimitive
const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal: Component<any> = (props) => (
  <DialogPrimitive.Portal {...props} />
)

const DialogOverlay: Component<any> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <DialogPrimitive.Overlay
      class={cn(
        "fixed inset-0 z-50 bg-black/80 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0",
        local.class
      )}
      {...others}
    />
  )
}

const DialogContent: Component<any> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"])
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        class={cn(
          "fixed inset-0 z-50 grid w-screen h-screen max-w-none max-h-none gap-4 overflow-hidden border bg-background p-6 shadow-lg duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 rounded-none md:translate-x-0 md:translate-y-0 md:data-[closed]:slide-out-to-top-0 md:data-[expanded]:slide-in-from-top-0",
          local.class
        )}
        {...others}
      >
        {local.children}
        <DialogPrimitive.CloseButton class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-red-500/25 bg-red-500/12 text-red-400 shadow-[0_8px_24px_rgba(239,68,68,0.18)] transition-all hover:bg-red-500/20 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:ring-offset-0 disabled:pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <span class="sr-only">Close</span>
        </DialogPrimitive.CloseButton>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

const DialogHeader: Component<any> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <div class={cn("flex flex-col space-y-1.5 text-center sm:text-left", local.class)} {...others} />
  )
}

const DialogFooter: Component<any> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <div
      class={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", local.class)}
      {...others}
    />
  )
}

const DialogTitle: Component<any> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <DialogPrimitive.Title
      class={cn("text-lg font-semibold leading-none tracking-tight", local.class)}
      {...others}
    />
  )
}

const DialogDescription: Component<any> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <DialogPrimitive.Description
      class={cn("text-sm text-muted-foreground", local.class)}
      {...others}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
}
