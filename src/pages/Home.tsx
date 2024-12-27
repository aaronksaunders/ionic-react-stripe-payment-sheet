import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import { useState } from "react";
import "./Home.css";
import StripeCheckoutButton from "../components/StripeCheckoutButton";
import React from "react";

const Home: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  // Convert dollar amount to cents for Stripe
  const amountInCents = Math.round(parseFloat(amount || "0") * 100);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ionic Stripe Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value || "")}
                placeholder="Enter your email"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Amount (USD)</IonLabel>
              <IonInput
                type="number"
                value={amount}
                onIonInput={(e) => setAmount(e.detail.value || "")}
                placeholder="Enter amount (e.g., 10.99)"
                min="0.50"
                step="0.01"
              />
            </IonItem>

            {/* Display the amount that will be charged */}
            {amount && (
              <IonItem lines="none">
                <IonLabel>
                  Will charge: ${amount} ({amountInCents} cents)
                </IonLabel>
              </IonItem>
            )}

            <StripeCheckoutButton
              amount={amountInCents}
              currency="usd"
              email={email}
            />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Home;
