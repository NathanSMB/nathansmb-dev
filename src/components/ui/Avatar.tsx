import { Show } from "solid-js";
import css from "./Avatar.css?inline";

interface AvatarProps {
    image?: string | null;
    name: string;
    size?: "default" | "lg";
}

export default function Avatar(props: AvatarProps) {
    const cls = () => `avatar ${props.size === "lg" ? "avatar-lg" : ""}`;

    return (
        <>
            <style>{css}</style>
            <Show
                when={props.image}
                fallback={
                    <span class={`${cls()} avatar-placeholder`}>
                        {props.name.charAt(0).toUpperCase()}
                    </span>
                }
            >
                <img src={props.image!} alt="" class={cls()} />
            </Show>
        </>
    );
}
