import Redis from "ioredis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
});

async function getProgress(userID: string, lessonID: string, moduleID: string) {
  console.log(`getting progress`);
  const progressKey = `progress:${userID}:${lessonID}:${moduleID}`;
  console.log(`progressKey is ${progressKey}`);
  const results = await redis.hgetall(progressKey);

  return results;
}

async function getMetrics(lessonID: string, moduleID: string) {
  console.log(`getting metrics`);
  const metricsKeyPattern = `metrics:*:${lessonID}:${moduleID}`;
  const keys = await redis.keys(metricsKeyPattern);

  const progressResults: Record<
    string,
    { exerciseID: string; answers: string[] }[]
  > = {};
  for (const key of keys) {
    const userID = key.split(":")[1];
    const exercises = await redis.hgetall(key);
    progressResults[userID] = Object.entries(exercises).map(
      ([exerciseID, answers]) => ({
        exerciseID,
        answers: JSON.parse(answers),
      }),
    );
  }

  return progressResults;
}

export async function GET(req: NextRequest) {
  // used for a) instructor retrieving metrics for a given module or b) student retrieving their own progress
  try {
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userID");
    const lessonID = searchParams.get("lessonID");
    const moduleID = searchParams.get("moduleID");

    if (!lessonID || !moduleID) {
      return NextResponse.json(
        { error: "Missing required parameters: lessonID and moduleID" },
        { status: 400 },
      );
    }

    let data;
    if (userID) {
      data = await getProgress(userID, lessonID, moduleID);
    } else {
      data = await getMetrics(lessonID, moduleID);
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userID, lessonID, moduleID, exerciseID, answers } = body;

    const progressKey = `progress:${userID}:${lessonID}:${moduleID}`;
    const metricsKey = `metrics:${lessonID}:${moduleID}`;
    const answersJson = JSON.stringify(answers);

    const transaction = redis.multi();
    // hset( key, field, value )
    transaction.hset(progressKey, exerciseID, answersJson);
    const metricField = `${userID}:${exerciseID}`;
    transaction.hset(metricsKey, metricField, answersJson);

    const results = await transaction.exec();

    if (!results) {
      return NextResponse.json(
        { error: "Transaction failed: no response from Redis" },
        { status: 500 },
      );
    }

    const hasErrors = results.some(([err]) => err !== null);
    if (hasErrors) {
      return NextResponse.json(
        { error: "Transaction failed with errors", details: results },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Exercise added successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Clear all data in Redis
    await redis.flushall();

    return NextResponse.json(
      { message: "All data deleted successfully from Redis" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
