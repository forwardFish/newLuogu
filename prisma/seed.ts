import { PrismaClient } from "@prisma/client";
import { KNOWLEDGE_NODES } from "../src/server/knowledge/knowledge-seed";

const prisma = new PrismaClient();

async function main() {
  let sortOrder = 0;
  for (const node of KNOWLEDGE_NODES) {
    sortOrder += 1;
    await prisma.knowledgeNode.upsert({
      where: { code: node.code },
      update: {
        name: node.name,
        parentCode: "parent" in node ? node.parent ?? null : null,
        level: "parent" in node ? 2 : 1,
        cspStage: "CSP-S",
        cspImportance: node.cspImportance,
        sortOrder
      },
      create: {
        code: node.code,
        name: node.name,
        parentCode: "parent" in node ? node.parent ?? null : null,
        level: "parent" in node ? 2 : 1,
        cspStage: "CSP-S",
        cspImportance: node.cspImportance,
        sortOrder
      }
    });
  }
  console.log(`Seeded ${KNOWLEDGE_NODES.length} knowledge nodes.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
