import Redis from 'ioredis';
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
});


export async function POST(req: NextRequest) {
  try {
    // Set a key in Redis
    console.log('POST CALLED');
    await redis.set('mykeyhi', 'Hello from Next.js API!');

    // Get the key from Redis
    const value = await redis.get('mykeyhi');
    
    // Send the Redis value as a response
    return new NextResponse(
      JSON.stringify({ message: 'Connected to Redis', value }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error connecting to Redis:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error connecting to Redis' }),
      { status: 500 }
    );
  }
}


// What is actually being stored here? Value submitted?

/*export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { lessonID, userID, moduleID, exerciseID, index, name } = body; // timestamp too

        if (!lessonID || !userID || !moduleID || !exerciseID || index === undefined || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const key = `completedExercises:${lessonID}:${userID}`;
        const exercise = { moduleID, exerciseID, index, name };

        // Write the exercise to Redis
        await redis.rpush(key, JSON.stringify(exercise));

        return NextResponse.json({ message: 'Exercise recorded successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error writing to Redis:', error);
        return NextResponse.json({ error: 'Failed to record exercise' }, { status: 500 });
    }
}*/