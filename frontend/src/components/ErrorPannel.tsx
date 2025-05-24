import { useEffect, useState } from "react";

const ErrorPannel = () => {
  const [activate, setActivate] = useState<boolean>(false);
  const [error, setError] = useState("Somethings went wrong.");
  useEffect(() => {
    setActivate(true);
    setTimeout(() => {
      setActivate(false);
    }, 4000);
  }, []);

  return (
    <div className="fixed top-4 right-4 transform transition-all duration-300 ease-in-out">
      <div className="flex items-center p-4 bg-red-100 border-l-4 border-red-500 rounded shadow-md">
        <div className="ml-3 mr-2 text-sm font-medium text-red-800">
          {error}
        </div>
      </div>
    </div>
  );
};

export default ErrorPannel;
