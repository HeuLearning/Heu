import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// context type
interface UserRoleContextType {
  userRole: "ad" | "in" | "st";
}

// create context with initial undefined value
const UserRoleContext = createContext<UserRoleContextType | undefined>(
  undefined
);

// props for provider
interface UserRoleProviderProps {
  children: ReactNode;
  accessToken: string;
}

export const UserRoleProvider: React.FC<UserRoleProviderProps> = ({
  children,
  accessToken,
}) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const response = await fetch(
        `http://localhost:8000/api/get-user-role`,
        options
      );

      const role = await response.json();
      setUserRole(role.role);
    };

    fetchUserRole();
  }, [accessToken]);

  return (
    <UserRoleContext.Provider
      value={{
        userRole,
      }}
    >
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
