import { UseGlobalContext } from "../context/GlobalContext";

interface PremiumOnlyProps {
    children: React.ReactNode;
    fallbackMessage?: string;
    requiredPermissions?: string[];
    requiresPremium?: boolean;
}

function PremiumOnly({
    children,
    fallbackMessage = "You do not have access to this feature",
    requiredPermissions = [],
    requiresPremium = true,
}: PremiumOnlyProps) {
    const {isPremiumUser, isAdmin, hasPermission} = UseGlobalContext();
    const hasRequiredPermissions = isAdmin || requiredPermissions.every(hasPermission);
    const hasRequiredSubscription = !requiresPremium || isPremiumUser;

    if (hasRequiredPermissions && hasRequiredSubscription) {
        return children;
    }
    return <div className="relative inline-block group">
        <div className="opacity-50 pointer-events-none">
            {children}
        </div>
        <div className="absolute inset-0 z-10 cursor-not-allowed">
            <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap
            after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-5 after:border-transparent after:border-t-gray-900">
                {fallbackMessage}
            </span>
        </div>
    </div>
}
export default PremiumOnly;
