import { prisma } from "@/src/lib/prisma";
import type { RawHttpResponse } from "@/src/server/luogu/luogu-types";

export class RawSnapshotService {
  async save(input: {
    subjectId: bigint;
    syncJobId?: bigint;
    sourceType: string;
    sourceKey?: string;
    response: RawHttpResponse;
    parserVersion?: string;
  }) {
    return prisma.rawSnapshot.create({
      data: {
        subjectId: input.subjectId,
        syncJobId: input.syncJobId,
        sourceType: input.sourceType,
        sourceKey: input.sourceKey,
        url: input.response.url,
        httpStatus: input.response.status,
        rawContent: input.response.body,
        rawJson: input.response.json === undefined ? undefined : (input.response.json as object),
        parserVersion: input.parserVersion
      }
    });
  }
}
