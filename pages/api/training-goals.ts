import type { NextApiRequest, NextApiResponse } from "next";
import { TrainingLoopService } from "@/src/server/training/training-loop-service";

export default async function handler(_request: NextApiRequest, response: NextApiResponse) {
  const service = new TrainingLoopService();
  const goals = await service.listGoals();
  return send(response, 200, { items: goals });
}

function send(response: NextApiResponse, status: number, data: any) {
  response.status(status).setHeader("Content-Type", "application/json");
  return response.end(JSON.stringify(data, (_key, value) => (typeof value === "bigint" ? value.toString() : value)));
}
