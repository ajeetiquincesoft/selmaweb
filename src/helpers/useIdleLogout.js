import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useIdleLogout = (timeout = 10 * 60 * 1000) => { // Default: 10 mins
  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const logout = () => {
      localStorage.removeItem("authUser");
      navigate("/login");
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, timeout);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [navigate, timeout]);
};

export default useIdleLogout;
