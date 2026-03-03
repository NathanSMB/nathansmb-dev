import { Show, createSignal, onMount, onCleanup } from "solid-js";
import { useLocation } from "@solidjs/router";
import { authClient } from "~/auth/auth-client";
import Avatar from "~/components/ui/Avatar";
import Spinner from "~/components/ui/Spinner";
import css from "./Nav.css?inline";

export default function Nav() {
    const session = authClient.useSession();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = createSignal(false);
    const [linksOpen, setLinksOpen] = createSignal(false);
    let navRef: HTMLElement | undefined;

    const isActive = (path: string) =>
        path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(path);

    const closeMenu = () => setMenuOpen(false);
    const closeLinks = () => setLinksOpen(false);

    const closeAll = () => {
        closeMenu();
        closeLinks();
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (
            (menuOpen() || linksOpen()) &&
            navRef &&
            !navRef.contains(e.target as Node)
        ) {
            closeAll();
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeAll();
    };

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        onCleanup(() => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        });
    });

    return (
        <>
            <style>{css}</style>
            <nav class="nav" ref={navRef}>
                <button
                    class={`nav-hamburger${linksOpen() ? " open" : ""}`}
                    aria-label="Menu"
                    aria-expanded={linksOpen()}
                    onClick={() => {
                        setLinksOpen(!linksOpen());
                        closeMenu();
                    }}
                >
                    <span />
                    <span />
                    <span />
                </button>
                <div class={`nav-links${linksOpen() ? " nav-links-open" : ""}`}>
                    <a
                        href="/"
                        class={isActive("/") ? "active" : ""}
                        onClick={closeLinks}
                    >
                        Home
                    </a>
                    <a
                        href="/about"
                        class={isActive("/about") ? "active" : ""}
                        onClick={closeLinks}
                    >
                        About
                    </a>
                </div>
                <div class="nav-session">
                    <Show
                        when={!session().isPending}
                        fallback={<Spinner size="sm" />}
                    >
                        <Show
                            when={session().data}
                            fallback={
                                <a
                                    class="nav-login"
                                    href={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                                >
                                    Log in
                                </a>
                            }
                        >
                            {(s) => (
                                <>
                                    <button
                                        class="session-trigger"
                                        aria-expanded={menuOpen()}
                                        onClick={() => {
                                            setMenuOpen(!menuOpen());
                                            closeLinks();
                                        }}
                                    >
                                        <Avatar
                                            image={s().user.image}
                                            name={s().user.name}
                                        />
                                        <span class="session-name">
                                            {s().user.name}
                                        </span>
                                        <span class="session-chevron">
                                            &#x25BE;
                                        </span>
                                    </button>
                                    <Show when={menuOpen()}>
                                        <div class="session-menu">
                                            <Show
                                                when={s().user.role === "admin"}
                                            >
                                                <a
                                                    href="/admin"
                                                    onClick={closeMenu}
                                                >
                                                    Admin
                                                </a>
                                            </Show>
                                            <a
                                                href="/settings/profile"
                                                onClick={closeMenu}
                                            >
                                                Settings
                                            </a>
                                            <div class="session-menu-separator" />
                                            <button
                                                class="logout-btn"
                                                onClick={() => {
                                                    closeMenu();
                                                    authClient.signOut();
                                                }}
                                            >
                                                Log out
                                            </button>
                                        </div>
                                    </Show>
                                </>
                            )}
                        </Show>
                    </Show>
                </div>
            </nav>
        </>
    );
}
