import type { ComponentType } from "react";
import {
  AdminInvitesBody,
  AdminPeopleBody,
  AdminPlansBody,
  AdminTenantsPlanBody,
} from "./admin-mocks";
import {
  ForgotPasswordBody,
  RegisterBody,
  ResetPasswordBody,
} from "./auth-mocks";
import {
  InviteEmailBody,
  PlatformInviteEmailBody,
  ResetEmailBody,
  VerifyEmailBody,
} from "./email-mocks";
import { InviteMembersBody } from "./invite-mocks";

/** One screen inside the browser chrome: a route label and its bodyless content. */
export type Screen = { label: string; Body: ComponentType };

/**
 * Multi-screen flows for the carousel. Each entry keeps the browser chrome fixed
 * and only swaps the body inside, so alternating never resizes the frame.
 */
export const flows = {
  register: [
    { label: "/register", Body: RegisterBody },
    { label: "inbox", Body: VerifyEmailBody },
  ],
  recovery: [
    { label: "/forgot-password", Body: ForgotPasswordBody },
    { label: "inbox", Body: ResetEmailBody },
    { label: "/reset-password", Body: ResetPasswordBody },
  ],
  invite: [
    { label: "/app/acme/settings", Body: InviteMembersBody },
    { label: "inbox", Body: InviteEmailBody },
  ],
  admin: [
    { label: "/admin/users", Body: AdminPeopleBody },
    { label: "/admin/invites", Body: AdminInvitesBody },
    { label: "inbox", Body: PlatformInviteEmailBody },
  ],
  plans: [
    { label: "/admin/plans", Body: AdminPlansBody },
    { label: "/admin/tenants", Body: AdminTenantsPlanBody },
  ],
} satisfies Record<string, Screen[]>;
