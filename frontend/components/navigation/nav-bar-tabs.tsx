import { useUser } from "@auth0/nextjs-auth0/client";
import React from "react";
import { NavBarTab } from "./nav-bar-tab";

export const NavBarTabs: React.FC = () => {
  const { user } = useUser();
  // console.log(user)
  return (
    <div className="nav-bar__tabs">
      {user && (
        <>
          <NavBarTab path="/protected" label="Protected" />
          <NavBarTab path="/admin" label="Admin" />
        </>
      )}
    </div>
  );
};