import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    const token = data.token || data.access_token;

    if (!token) {
      throw new Error("Token was not returned by the server.");
    }

    localStorage.setItem("token", token);

    if (data.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
    } else {
      const userData = {
        email: data.email || "",
        name: data.name || "",
      };

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
   <AuthContext.Provider
  value={{
    user,
    setUser,
    login,
    logout,
  }}
>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};