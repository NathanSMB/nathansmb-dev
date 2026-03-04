import { createSignal, onCleanup, type JSX } from "solid-js";

export interface NavLink {
    href: string;
    label: string;
}

const [sectionLinks, setSectionLinks] = createSignal<NavLink[] | undefined>();

export { sectionLinks };

export function NavLinksProvider(props: {
    links: NavLink[];
    children: JSX.Element;
}) {
    setSectionLinks(props.links);
    onCleanup(() => setSectionLinks(undefined));

    return <>{props.children}</>;
}
