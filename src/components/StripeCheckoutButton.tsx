import React, { useState } from "react";
import { IonButton, useIonToast } from "@ionic/react";
import { PaymentSheetEventsEnum, Stripe } from "@capacitor-community/stripe";

interface PaymentSheetProps {
  amount: number;
  currency: string;
  email: string;
}

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const StripeCheckoutButton: React.FC<PaymentSheetProps> = ({
  amount,
  currency,
  email,
}) => {
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();

  const showToast = (message: string, isError = false) => {
    present({
      message,
      duration: 3000,
      position: "bottom",
      color: isError ? "danger" : "success",
    });
  };

  const validateInput = (): boolean => {
    if (!email || !isValidEmail(email)) {
      showToast("Please enter a valid email address", true);
      return false;
    }

    if (!amount || amount < 50) {
      showToast("Minimum amount is $0.50", true);
      return false;
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!validateInput()) {
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create PaymentIntent on the server
      const response = await fetch(
        "http://127.0.0.1:3000/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            currency,
            email,
          }),
        }
      );

      const { paymentIntent, ephemeralKey, customer } = await response.json();
      console.log("paymentIntent", paymentIntent);
      console.log("ephemeralKey", ephemeralKey);
      console.log("customer", customer);

      // Step 2: Initialize the PaymentSheet
      try {
        console.log("Starting createPaymentSheet...");
        await Stripe.createPaymentSheet({
          paymentIntentClientSecret: paymentIntent,
          customerId: customer,
          customerEphemeralKeySecret: ephemeralKey,
          merchantDisplayName: "Personal",
        });

        // Step 3: Present the PaymentSheet
        const { paymentResult } = await Stripe.presentPaymentSheet();
        console.log("Payment result:", paymentResult);

        if (paymentResult === PaymentSheetEventsEnum.Completed) {
          showToast("Payment successful!");
          return true;
        } else {
          throw new Error("Payment failed");
        }
      } catch (error) {
        console.error("Payment sheet error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Payment failed:", error);
      showToast("Payment failed. Please try again.", true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonButton
      expand="block"
      onClick={handleCheckout}
      disabled={loading || !email || amount < 50}
    >
      {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
    </IonButton>
  );
};

export default StripeCheckoutButton;
