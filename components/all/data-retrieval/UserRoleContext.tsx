import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from '../../../utils/supabase/client'; // Adjust import according to your setup

const supabase = createClient()

// Context type
interface UserRoleContextType {
  userRole: "ad" | "in" | "st" | null; // Include null for loading state
}

// Create context with initial undefined value
const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

// Props for provider
interface UserRoleProviderProps {
  children: ReactNode;
  accessToken: string;
}

export const UserRoleProvider: React.FC<UserRoleProviderProps> = ({ children, accessToken }) => {
  const [userRole, setUserRole] = useState<"ad" | "in" | "st" | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        return;
      }

      const userID = session.session?.user.id;

      const { data: roleType, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userID)
      .single();

      console.log("da Role");
      console.log(roleType);

      if (rolesError) {
        console.error("Error fetching user role:", rolesError);
        return;
      }

      setUserRole(roleType?.role || null);
    };

    fetchUserRole();
  }, [accessToken]);

  return (
    <UserRoleContext.Provider value={{ userRole }}>
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
