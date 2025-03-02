import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createCheckoutSession, createCustomerPortalSession, getPlans, getCustomerSubscription, createStripeCustomer } from "@/lib/stripe";
import { subscriptions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// TODO: use our tryCatch wrapper
export const subscriptionRouter = createTRPCRouter({
  getPlans: protectedProcedure
    .query(async () => {
      return await getPlans();
    }),

  createCheckoutSession: protectedProcedure
    .input(z.object({
      priceId: z.string(),
      returnUrl: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const [subscription] = await ctx.db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, ctx.userId));

        if (!subscription?.stripeCustomerId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No Stripe customer found",
          });
        }

        const { sessionId } = await createCheckoutSession(
          input.priceId,
          subscription.stripeCustomerId,
          input.returnUrl
        );

        return { sessionId };
      } catch (error) {
        console.error("Error creating checkout session:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }
    }),

  createCustomerPortalSession: protectedProcedure
    .input(z.object({
      returnUrl: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const [subscription] = await ctx.db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, ctx.userId));

        if (!subscription?.stripeCustomerId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No Stripe customer found",
          });
        }

        const session = await createCustomerPortalSession(
          subscription.stripeCustomerId,
          input.returnUrl
        );
        return { url: session.url };
      } catch (error) {
        console.error("Error creating customer portal session:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create customer portal session",
        });
      }
    }),

  getSubscription: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const [subscription] = await ctx.db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, ctx.userId));

        if (!subscription) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No subscription found",
          });
        }

        return subscription;
      } catch (error) {
        console.error("Error fetching subscription:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch subscription",
        });
      }
    }),

  syncSubscriptionData: publicProcedure
    .input(z.object({
      customerId: z.string(),
      eventType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { subscription, defaultPaymentMethod, firstItem, minutes } = 
          await getCustomerSubscription(input.customerId);

        // Only include minutes in the update if it's a payment-related event
        const shouldUpdateMinutes = 
          input.eventType === 'invoice.paid' || 
          input.eventType === 'checkout.session.completed';

        await ctx.db.update(subscriptions)
          .set({
            status: subscription.status ?? 'none',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
            priceId: firstItem.price.id ?? null,
            stripeSubscriptionId: subscription.id,
            paymentMethod: defaultPaymentMethod?.card
              ? {
                  brand: defaultPaymentMethod.card.brand,
                  last4: defaultPaymentMethod.card.last4,
                }
              : null,
            ...(shouldUpdateMinutes && minutes !== undefined && { minutes }),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, input.customerId));

        return { success: true };
      } catch (error) {
        console.error("Error syncing subscription data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync subscription data",
        });
      }
    }),

  initializeSubscription: protectedProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if a subscription already exists for the user
        const [existingSubscription] = await ctx.db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, ctx.userId));
        
        if (existingSubscription) {
          // Subscription already exists, return it
          return existingSubscription;
        }
        
        // Create Stripe customer
        const customer = await createStripeCustomer(input.email);
        
        // Create subscription entry with default values
        const [newSubscription] = await ctx.db
          .insert(subscriptions)
          .values({
            userId: ctx.userId,
            stripeCustomerId: customer.id,
            status: 'active', // Free plan is active by default
            minutes: 120, // Default 120 minutes (2 hours) for free plan
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        return newSubscription;
      } catch (error) {
        console.error("Error initializing subscription:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initialize subscription",
        });
      }
    }),
}); 