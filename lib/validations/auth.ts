import * as z from "zod"

export const userAuthSchema = z.object({
  email: z.string().email(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
