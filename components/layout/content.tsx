import { BulkActionBar } from "./bulk-actions-bar";
import { UnifiedGrid } from "../grid/unified-grid";

export function FileManagerContent() {
    return (
        <div>
            <BulkActionBar />
            <UnifiedGrid />
        </div>
    );
}