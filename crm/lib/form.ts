import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

/**
 * Bridges Zod v4 schemas to React Hook Form.
 *
 * Zod v4 types `z.coerce.number()` with an `unknown` input while the form
 * fields are typed with the parsed output (numbers). The resolver is correct at
 * runtime, so we align the static type with the schema output.
 */
export function zodForm<T extends FieldValues>(schema: z.ZodType<T>): Resolver<T> {
  return zodResolver(schema as never) as unknown as Resolver<T>;
}
