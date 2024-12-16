import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { createClient } from "../../../utils/supabase/client"; // Adjust import according to your setup

const supabase = createClient();

// Context type
interface UserRoleContextType {
    UID: string | null;
    userRole: "ad" | "in" | "st" | null; // Include null for loading state
    preferredName: string | null;
    legalName: string | null;
    email: string | null;
}

// Create context with initial undefined value
const UserRoleContext = createContext<UserRoleContextType | undefined>(
    undefined,
);

// Props for provider
interface UserRoleProviderProps {
    children: ReactNode;
    accessToken: string | null;
}

export const UserRoleProvider: React.FC<UserRoleProviderProps> = ({
    children,
    accessToken,
}) => {
    const [UID, setUID] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<"ad" | "in" | "st" | null>(null);
    const [preferredName, setPreferredName] = useState<string | null>(null);
    const [legalName, setLegalName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: session, error: sessionError } =
                await supabase.auth.getSession();
            if (sessionError) {
                console.error("Error fetching session:", sessionError);
                return;
            }

            const userID = session.session?.user.id;

            const { data: roleType, error: rolesError } = await supabase
                .from("users_new")
                .select("role, preferred_name, legal_name, email")
                .eq("user_id", userID)
                .single();

            if (rolesError) {
                console.error("Error fetching user role:", rolesError);
                return;
            }

            setUID(userID || null);
            setUserRole(roleType?.role || null);
            setPreferredName(roleType?.preferred_name || null);
            setLegalName(roleType?.legal_name || null);
            setEmail(roleType?.email || null);
        };

        fetchUserRole();
    }, [accessToken]);

    return (
        <UserRoleContext.Provider value={{ UID, userRole, preferredName, legalName, email }}>
            {children}
        </UserRoleContext.Provider>
    );
};

export const useUserRole = (): UserRoleContextType => {
    const context = useContext(UserRoleContext);
    if (context === undefined) {
        throw new Error("useUserRole must be used within a UserRoleProvider");
    }
    return context;
};