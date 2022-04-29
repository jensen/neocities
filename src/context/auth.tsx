import React, { useContext } from "react";

type User = null | {
  id: string;
};

const AuthContext = React.createContext<{
  user: User;
  isLoggedIn: boolean;
}>({ user: null, isLoggedIn: false });

interface IAuthProviderProps {
  user: User;
}

export default function AuthProvider(
  props: React.PropsWithChildren<IAuthProviderProps>
) {
  return (
    <AuthContext.Provider
      value={{ user: props.user, isLoggedIn: props.user?.id !== null }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used with an AuthProvider.");
  }

  return context;
};
