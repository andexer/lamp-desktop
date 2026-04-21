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
          "fixed left-[50%] top-[50%] z-50 grid w-full max-width-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-[48%] data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-[48%] rounded-lg",
          local.class
        )}
        {...others}
      >
        {local.children}
        <DialogPrimitive.CloseButton class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
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
