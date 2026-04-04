import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const SiteContext = createContext();

export function SiteProvider({ children }) {
  const [activeSite, setActiveSite] = useState(import.meta.env.VITE_SITE_ID || "default");
  const [sites, setSites] = useState([]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const { data } = await api.get("/sites");
        setSites(data || []);
        if (data && data.length > 0 && (activeSite === "default" || !activeSite)) {
          setActiveSite(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch sites:", err);
      }
    };
    fetchSites();
  }, []);

  return (
    <SiteContext.Provider value={{ activeSite, setActiveSite, sites, setSites }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);
