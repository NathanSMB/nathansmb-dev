import { Show } from "solid-js";

interface AvatarProps {
  image?: string | null;
  name: string;
  class?: string;
}

export default function Avatar(props: AvatarProps) {
  return (
    <Show
      when={props.image}
      fallback={
        <span class={`avatar avatar-placeholder ${props.class ?? ""}`}>
          {props.name.charAt(0).toUpperCase()}
        </span>
      }
    >
      <img
        src={props.image!}
        alt=""
        class={`avatar ${props.class ?? ""}`}
      />
    </Show>
  );
}
