import { useErrorStore } from "../exception_handling/useErrorStore";

export const GlobalErrorPanel = () => {
  const { errors, removeError } = useErrorStore();

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {errors.map((error) => (
        <div
          key={error.id}
          className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg"
        >
          <div className="flex items-start">
            <div className="ml-3 p-1.5">
              <p className="text-sm font-medium text-red-800">
                {error.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                onClick={() => removeError(error.id)}
              >
                <span className="material-icons md-18">close</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
