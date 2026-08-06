/**
 * Usage service
 *
 * AI spend gates for agent routes/tools. Seat and plan gates live in
 * `@/domains/billing/service`; the tenant Billing page reads the full snapshot.
 */

export { assertAiBudget } from "@/domains/billing/service";
