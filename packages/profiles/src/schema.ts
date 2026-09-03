import * as z from 'zod'
import { BUILTIN_KEYS, KEYWORD_KEYS, OPERATOR_KEYS, TYPE_KEYS } from './keys'

export const LOCALE_PATTERN = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/

export const SpellingsSchema = z.array(z.string()).readonly()

export const ProfileOptionsSchema = z.strictObject({
  indexBase: z.union([z.literal(0), z.literal(1)]),
  caseSensitive: z.boolean(),
  foldAccents: z.boolean(),
  implicitDeclarations: z.boolean(),
  requireSemicolons: z.boolean(),
  typedParameters: z.boolean(),
  assignWithEquals: z.boolean(),
})

export type ProfileOptions = z.infer<typeof ProfileOptionsSchema>

export const DEFAULT_OPTIONS: ProfileOptions = Object.freeze({
  indexBase: 1,
  caseSensitive: false,
  foldAccents: true,
  implicitDeclarations: false,
  requireSemicolons: true,
  typedParameters: true,
  assignWithEquals: false,
})

const keywordKeys = z.enum(KEYWORD_KEYS)
const typeKeys = z.enum(TYPE_KEYS)
const operatorKeys = z.enum(OPERATOR_KEYS)
const builtinKeys = z.enum(BUILTIN_KEYS)

const IdSchema = z.string().min(1)
const LocaleSchema = z
  .string()
  .regex(LOCALE_PATTERN, 'locale must be a BCP-47 tag such as es or pt-BR')

/** Every section and option present: the shape of a resolved profile's data. */
export const ResolvedProfileDataSchema = z.strictObject({
  id: IdSchema,
  locale: LocaleSchema,
  keywords: z.record(keywordKeys, SpellingsSchema),
  types: z.record(typeKeys, SpellingsSchema),
  operators: z.record(operatorKeys, SpellingsSchema),
  builtins: z.record(builtinKeys, SpellingsSchema),
  options: ProfileOptionsSchema,
})

export type ProfileData = z.infer<typeof ResolvedProfileDataSchema>

const partialSections = {
  keywords: z.partialRecord(keywordKeys, SpellingsSchema).optional(),
  types: z.partialRecord(typeKeys, SpellingsSchema).optional(),
  operators: z.partialRecord(operatorKeys, SpellingsSchema).optional(),
  builtins: z.partialRecord(builtinKeys, SpellingsSchema).optional(),
  options: ProfileOptionsSchema.partial().optional(),
}

/** A profile that extends another may omit anything the parent provides. */
const ExtendingProfileSchema = z.strictObject({
  id: IdSchema,
  extends: IdSchema,
  locale: LocaleSchema.optional(),
  ...partialSections,
})

/**
 * A root profile must spell every key; options may still be partial (defaults fill them).
 * It has no `extends` key at all: strictObject rejects the key, which is what routes an
 * extending profile to ExtendingProfileSchema, and `z.undefined()` cannot be rendered
 * by `toJSONSchema`.
 */
const RootProfileSchema = z.strictObject({
  id: IdSchema,
  locale: LocaleSchema,
  keywords: z.record(keywordKeys, SpellingsSchema),
  types: z.record(typeKeys, SpellingsSchema),
  operators: z.record(operatorKeys, SpellingsSchema),
  builtins: z.record(builtinKeys, SpellingsSchema),
  options: ProfileOptionsSchema.partial().optional(),
})

export const ProfileInputSchema = z.union([ExtendingProfileSchema, RootProfileSchema])

export type ProfileInput = z.infer<typeof ProfileInputSchema>

/**
 * Strips `readOnly` recursively from a JSON Schema.
 *
 * `SpellingsSchema` is `.readonly()` so the TS type (`ProfileData['keywords'][K]`, etc.) stays
 * a readonly array — but Zod's `toJSONSchema` surfaces `.readonly()` as JSON Schema
 * `readOnly: true`. Editor form generators (and the `$schema` consumers this is for) treat
 * `readOnly` as "disable this field", which would disable exactly the spelling arrays a
 * profile author must edit. The Zod-level readonly-ness is a TypeScript concern only.
 */
function stripReadOnly(schema: object): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => (key === 'readOnly' ? undefined : value)),
  ) as Record<string, unknown>
}

/** JSON Schema for editor tooling and `$schema` in user profile files. */
export const profileJsonSchema: Record<string, unknown> = stripReadOnly(
  z.toJSONSchema(RootProfileSchema),
)
