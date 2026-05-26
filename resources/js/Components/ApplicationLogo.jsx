export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            {...props}
            src="/img/logo.png" 
            alt="Logo"
            className={className}
        />
    );
}
