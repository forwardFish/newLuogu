import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { formatErrorDetail, jsonResponse } from "@/src/lib/json";
import { isDatabaseMissing, localSubject } from "@/src/server/local-loop/api-fallback";

const schema = z.object({
  luoguUid: z.string().trim().regex(/^\d+$/, "luoguUid must be numeric"),
  displayName: z.string().trim().optional(),
  subjectType: z.enum(["SELF_CHILD", "PUBLIC_UID"]).default("PUBLIC_UID"),
  target: z.literal("CSP-S_FIRST_PRIZE").default("CSP-S_FIRST_PRIZE")
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonResponse({ error: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  try {
    const subject = await prisma.analyzedSubject.upsert({
      where: { luoguUid_subjectType: { luoguUid: input.luoguUid, subjectType: input.subjectType } },
      update: {
        displayName: input.displayName,
        target: input.target
      },
      create: {
        luoguUid: input.luoguUid,
        displayName: input.displayName,
        subjectType: input.subjectType,
        target: input.target
      }
    });
    return jsonResponse({
      subjectId: subject.id,
      luoguUid: subject.luoguUid,
      subjectType: subject.subjectType,
      target: subject.target
    });
  } catch (error) {
    if (isDatabaseMissing(error)) {
      return jsonResponse(await localSubject());
    }
    return jsonResponse(
      {
        error: "failed to create analyzed subject",
        detail: formatErrorDetail(error)
      },
      { status: 500 }
    );
  }
}
