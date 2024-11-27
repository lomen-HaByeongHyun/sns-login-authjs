"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

const ConfigLayout = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default ConfigLayout;
