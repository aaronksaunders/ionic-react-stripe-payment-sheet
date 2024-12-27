require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a PaymentIntent for use with PaymentSheet
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
async function createPaymentIntent(req, res) {
    console.log("createPaymentIntent");
  try {
    // Type the request body
    const { amount, currency, email } = req.body;

    // Create a customer first - PaymentSheet works best with a customer
    const customer = await stripe.customers.create({
      email: email,
    });

    // Create ephemeral key for the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2023-10-16" } // Make sure to use the latest API version
    );

    // Create the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
      // Enable future payments for this customer
      setup_future_usage: "off_session",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: { integration_check: "payment_sheet" },
    });

    // Return all the necessary information for PaymentSheet
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error("PaymentIntent creation error:", error);
    res.status(500).json({
      error: "Failed to create PaymentIntent",
      message: error.message,
    });
  }
}

module.exports = {
  createPaymentIntent,
};
