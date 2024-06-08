import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await axios.get("/profile", { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  
    if (!user) {
      fetchUserProfile();
    }
  }, []);
  

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
