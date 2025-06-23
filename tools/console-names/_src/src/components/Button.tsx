import { ButtonProps, Button as FlowbiteButton } from "flowbite-react";

export function Button(props: ButtonProps) {
  return (
    <FlowbiteButton
      className="font-light m-auto"
      theme={{
        base: "rounded-none! bg-red-700! hover:bg-red-800! focus:border-0 focus:ring-0 active:bg-red-900! cursor-pointer",
        pill: "rounded-none!",
      }}
      {...props}
    />
  );
}
