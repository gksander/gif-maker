import * as React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/all";
import classNames from "classnames";

type AlertMessageProps = {
  message: string;
  onDismiss: () => void;
};

export const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
  onDismiss,
}) => {
  const isSuccess = React.useMemo(() => /download/i.test(message), [message]);
  const title = React.useMemo(
    () => (isSuccess ? "Conversion completed!" : "Uh oh..."),
    [isSuccess],
  );

  return (
    <div
      className={classNames(
        "rounded-md p-4 shadow-lg",
        isSuccess ? "bg-green-50" : "bg-red-50",
      )}
    >
      <div className="flex">
        <div
          className={classNames(
            "flex-shrink-0",
            isSuccess ? "text-green-400" : "text-red-400",
          )}
        >
          {isSuccess ? (
            <FaCheckCircle className="text-xl" />
          ) : (
            <FaTimesCircle className="text-xl" />
          )}
        </div>
        <div className="ml-3">
          <h3
            className={classNames(
              "text-sm font-medium",
              isSuccess ? "text-green-800" : "text-red-800",
            )}
          >
            {title}
          </h3>
          <div
            className={classNames(
              "mt-2 text-sm",
              isSuccess ? "text-green-700" : "text-red-700",
            )}
          >
            <p>{message}</p>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                className={classNames(
                  "px-2 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2",
                  isSuccess
                    ? "bg-green-50 text-green-800 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600"
                    : "bg-red-50 text-red-800 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600",
                )}
                onClick={onDismiss}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
