import axios from "axios";
import { useRef, useState } from "react";
import axiosInstance, { refreshAccessToken } from "../utility/axiosInstance";
import { UseGlobalContext } from "../context/GlobalContext";
import { addError } from "../exception_handling/useErrorStore";

type ButtonState = "idle" | "creating" | "checkout" | "confirming";

interface OrderResponse {
  transactionId: number;
  gatewayOrderId: string;
  checkoutKey: string;
  amount: number;
  currency: string;
}

interface StatusResponse {
  status: "CREATING" | "CREATED" | "PAID" | "FAILED";
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: () => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
}

interface RazorpayFailure {
  error?: { description?: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: RazorpayFailure) => void
  ) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;
const maxStatusChecks = 60;
const statusCheckDelay = 2000;

const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load Razorpay Checkout"));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
};

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

const getButtonLabel = (isPremiumUser: boolean, state: ButtonState) => {
  if (isPremiumUser) return "Premium";
  if (state === "creating") return "Creating Order...";
  if (state === "checkout") return "Complete Payment";
  if (state === "confirming") return "Confirming...";

  return "Get Premium";
};

const PremiumButton = () => {
  const { isPremiumUser, setIsPremiumUser } = UseGlobalContext();
  const [state, setState] = useState<ButtonState>("idle");
  const pendingTransaction = useRef<number | null>(null);
  const polling = useRef(false);

  const confirmPayment = async (transactionId: number) => {
    if (polling.current) return;
    polling.current = true;
    setState("confirming");

    try {
      for (let attempt = 0; attempt < maxStatusChecks; attempt += 1) {
        const response = await axiosInstance.get<StatusResponse>(
          `/api/v1/payments/${transactionId}/status`
        );

        if (response.data.status === "PAID") {
          try {
            await refreshAccessToken();
          } catch {
            throw new Error(
              "Premium is active, but the session could not be refreshed. Try again."
            );
          }

          pendingTransaction.current = null;
          setIsPremiumUser(true);
          return;
        }

        if (response.data.status === "FAILED") {
          throw new Error("Payment failed. Please try again.");
        }

        if (attempt < maxStatusChecks - 1) {
          await wait(statusCheckDelay);
        }
      }

      addError(
        "Payment confirmation is delayed. Click again to check its status."
      );
    } catch (error) {
      addError(getErrorMessage(error, "Could not confirm payment"));
    } finally {
      polling.current = false;
      setState("idle");
    }
  };

  const startPayment = async () => {
    if (state !== "idle" || isPremiumUser) return;

    if (pendingTransaction.current) {
      await confirmPayment(pendingTransaction.current);
      return;
    }

    setState("creating");
    try {
      await loadRazorpay();
      const response = await axiosInstance.post<OrderResponse>(
        "/api/v1/payments/orders",
        { gateway: "RAZORPAY" }
      );
      pendingTransaction.current = response.data.transactionId;

      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable");

      let completed = false;
      const checkout = new Razorpay({
        key: response.data.checkoutKey,
        order_id: response.data.gatewayOrderId,
        amount: response.data.amount,
        currency: response.data.currency,
        name: "LinkShort",
        description: "Lifetime Premium",
        handler: () => {
          completed = true;
          void confirmPayment(response.data.transactionId);
        },
        modal: {
          ondismiss: () => {
            if (!completed) {
              pendingTransaction.current = null;
              setState("idle");
            }
          },
        },
        theme: { color: "#6366f1" },
      });

      checkout.on("payment.failed", (failure) => {
        pendingTransaction.current = null;
        setState("idle");
        addError(
          failure.error?.description ?? "Payment failed. Please try again."
        );
      });

      setState("checkout");
      checkout.open();
    } catch (error) {
      setState("idle");
      addError(getErrorMessage(error, "Could not start payment"));
    }
  };

  const label = getButtonLabel(isPremiumUser, state);

  return (
    <button
      type="button"
      onClick={() => void startPayment()}
      disabled={isPremiumUser || state !== "idle"}
      className="rounded-md bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 font-medium text-white shadow transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
    >
      {label}
    </button>
  );
};

export default PremiumButton;
