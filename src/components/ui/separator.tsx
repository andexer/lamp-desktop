import { type Component, splitProps } from "solid-js"
import { Separator as SeparatorPrimitive } from "@kobalte/core/separator"
import type { SeparatorRootProps } from "@kobalte/core/separator"

import { cn } from "~/lib/utils"

const Separator: Component<SeparatorRootProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "orientation"])
  return (
    <SeparatorPrimitive
      orientation={local.orientation ?? "horizontal"}
      class={cn(
        "shrink-0 bg-border",
        local.orientation === "vertical" ? "h-full w-[1px]" : "h-[1px] w-full",
        local.class
      )}
      {...others}
    />
  )
}

export { Separator }
