import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createCheckoutSession, createCustomerPortalSession, getPlans, getCustomerSubscription } from "@/lib/stripe";
import { subscriptions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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

  syncSubscriptionData: protectedProcedure
    .input(z.object({
      customerId: z.string(),
      eventType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { subscription, defaultPaymentMethod, firstItem, hours } = 
          await getCustomerSubscription(input.customerId);

        await ctx.db.update(subscriptions)
          .set({
            status: subscription.status ?? 'none',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
            priceId: firstItem.price.id ?? null,
            paymentMethod: defaultPaymentMethod?.card
              ? {
                  brand: defaultPaymentMethod.card.brand,
                  last4: defaultPaymentMethod.card.last4,
                }
              : null,
            ...(hours !== undefined && { hours }),
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
}); 