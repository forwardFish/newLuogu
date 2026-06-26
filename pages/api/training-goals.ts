import type { NextApiRequest, NextApiResponse } from "next";
import { TrainingLoopService } from "@/src/server/training/training-loop-service";

export default async function handler(_request: NextApiRequest, response: NextApiResponse) {
  const service = new TrainingLoopService();
  const goals = await service.listGoals();
  return response.status(200).json({ items: goals.length });
}
