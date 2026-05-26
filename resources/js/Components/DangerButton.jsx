import { Button } from "@/Components/ui/button";

export default function DangerButton({ className = "", ...props }) {
    return (
        <Button
            className={className}
            variant="destructive"
            {...props}
        />
    );
}

