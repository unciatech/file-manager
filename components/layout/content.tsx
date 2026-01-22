"use client";

import { useFileManager } from "@/context/file-manager-context";
import { MODE } from "@/types/file-manager";
import { BulkActionBar } from ".";
import { UnifiedGrid } from "../grid/unified-grid";

export function FileManagerContent() {
    const { mode } = useFileManager();
    return (
        <div>
            {mode === MODE.PAGE && <BulkActionBar />}
            <UnifiedGrid />
        </div>
    );
}