
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-7xl font-bold web3-gradient-text mb-4">404</h1>
        <p className="text-2xl text-foreground mb-8">This page doesn't exist in any blockchain</p>
        <Link to="/" className="web3-button inline-block">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
