export default function DepEdLogo({ className = '', ...props }) {
    return (
        <img
            {...props}
            src="/img/deped.png"
            alt="DepEd Logo"
            className={className}
        />
    );
}

