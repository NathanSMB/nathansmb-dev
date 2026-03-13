import { Show } from "solid-js";
import css from "./Banner.css?inline";

interface BannerProps {
    variant: "error" | "success" | "info";
    message: string | false | null | undefined;
    class?: string;
}

export default function Banner(props: BannerProps) {
    const cls = () =>
        `banner banner-${props.variant}${props.class ? ` ${props.class}` : ""}`;

    return (
        <Show when={props.message}>
            <style>{css}</style>
            <div class={cls()}>{props.message}</div>
        </Show>
    );
}
