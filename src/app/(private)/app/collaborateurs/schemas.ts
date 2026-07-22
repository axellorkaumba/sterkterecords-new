import { z } from "zod";

export const inviteCollaboratorSchema = z.object({
  email: z.string().trim().email(),
  permission: z.enum(["view", "manage"]),
});
export type InviteCollaboratorValues = z.infer<typeof inviteCollaboratorSchema>;
