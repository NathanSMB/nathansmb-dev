import { Show } from "solid-js";
import css from "./Banner.css?inline";

interface BannerProps {
    variant: "error" | "success" | "info";
    message: string | false | null | undefined;
}

export default function Banner(props: BannerProps) {
    return (
        <Show when={props.message}>
            <style>{css}</style>
            <div class={`banner banner-${props.variant}`}>{props.message}</div>
        </Show>
    );
}
