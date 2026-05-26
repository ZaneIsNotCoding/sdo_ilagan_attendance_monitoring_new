import { Button } from "@/Components/ui/button";

export default function PrimaryButton({ className = "", ...props }) {
    return (
        <Button
            className={className}
            variant="blue"
            type="submit"
            {...props}
        />
    );
}
