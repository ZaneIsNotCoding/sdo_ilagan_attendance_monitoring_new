import { Button } from "@/Components/ui/button";

export default function SecondaryButton({ className = "", type = "button", ...props }) {
    return (
        <Button
            className={className}
            variant="secondary"
            type={type}
            {...props}
        />
    );
}
