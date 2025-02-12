import React from "react";
import { useState, useEffect } from "react";

const UnauthorizedPage = () => {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null); 
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user) {
        setCurrentUser({
          name: user.name,
          role: user.role,
        });
      }
      console.log(user)
      
    }, []);
    console.log(currentUser);
  return (
    <div className="text-center p-6">
      <h1 className="text-xl font-bold">Unauthorized Access</h1>
      <p>You do not have permission to view this page.</p>
    </div>
  );
};

export default UnauthorizedPage;