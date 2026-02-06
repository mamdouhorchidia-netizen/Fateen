"use client";

import React, { useEffect, useState } from "react";
import { Chat } from "../components/Chat";
import { Login } from "../components/Login";
import { loadAuth, StoredAuth } from "../lib/auth";

export default function Page() {
  const [auth, setAuth] = useState<StoredAuth | null>(null);

  useEffect(() => {
    setAuth(loadAuth());
  }, []);

  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", background: "#030712", padding: 20 }}>
        <Login onLoggedIn={() => setAuth(loadAuth())} />
      </div>
    );
  }

  return <Chat auth={auth} />;
}
