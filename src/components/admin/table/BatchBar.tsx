import { Show } from "solid-js";
import type { Role } from "../types";
import { isValidRole } from "../types";
import Button from "~/components/ui/Button";
import Select from "~/components/ui/Select";
import TextInput from "~/components/ui/TextInput";
import ProgressBar from "~/components/ui/ProgressBar";
import css from "./BatchBar.css?inline";

const roleOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
];

interface BatchBarProps {
    selectedCount: number;
    batchProgress: { current: number; total: number; label: string } | null;
    batchRole: Role;
    batchBanReason: string;
    onSetBatchRole: (value: Role) => void;
    onBatchSetRole: () => void;
    onSetBatchBanReason: (value: string) => void;
    onBatchBan: () => void;
    onBatchUnban: () => void;
    onBatchDelete: () => void;
}

export default function BatchBar(props: BatchBarProps) {
    return (
        <>
            <style>{css}</style>
            <div class="admin-batch-bar">
                <Show
                    when={!props.batchProgress}
                    fallback={
                        <ProgressBar
                            current={props.batchProgress!.current}
                            total={props.batchProgress!.total}
                            label={props.batchProgress!.label}
                        />
                    }
                >
                    <span>{props.selectedCount} user(s) selected</span>
                    <Select
                        value={props.batchRole}
                        options={roleOptions}
                        onChange={(value) => {
                            if (isValidRole(value)) props.onSetBatchRole(value);
                        }}
                    />
                    <Button color="neutral" onClick={props.onBatchSetRole}>
                        Set role
                    </Button>
                    <TextInput
                        size="lg"
                        placeholder="Ban reason (optional)"
                        value={props.batchBanReason}
                        onInput={props.onSetBatchBanReason}
                    />
                    <Button color="danger" onClick={props.onBatchBan}>
                        Ban selected
                    </Button>
                    <Button color="success" onClick={props.onBatchUnban}>
                        Unban selected
                    </Button>
                    <Button color="danger" onClick={props.onBatchDelete}>
                        Delete selected
                    </Button>
                </Show>
            </div>
        </>
    );
}
