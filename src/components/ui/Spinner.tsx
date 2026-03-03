import css from "./Spinner.css?inline";

export default function Spinner() {
    return (
        <>
            <style>{css}</style>
            <div class="spinner-container">
                <div class="spinner" />
            </div>
        </>
    );
}
