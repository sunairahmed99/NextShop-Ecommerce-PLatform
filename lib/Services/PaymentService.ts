import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

export class PaymentService {
  /**
   * Creates a Stripe Payment Intent for the specified amount.
   * @param amount The amount in PKR (e.g., 500 for Rs. 500)
   * @returns The client secret for the payment intent
   */
  static async createPaymentIntent(amount: number) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: "pkr",
        payment_method_types: ["card"],
      });

      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      };
    } catch (error: any) {
      console.error("PaymentService Error:", error);
      throw new Error(error.message || "Failed to create payment intent");
    }
  }
}
