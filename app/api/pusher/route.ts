'use server'

import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";
import { createClient } from '@supabase/supabase-js';

const pusher = new Pusher({
  appId: "1897818",
  key: "4d40e9afa8517ca3683b",
  secret: "8b6f8efd00d3a48b4963",
  cluster: "us2",
  useTLS: true
});


export async function GET(req: NextRequest) {
  console.log('GET request to /api/module/current');

  try {
    // Parse query parameters (GET requests don't have a body typically)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const access_token = searchParams.get('access_token');

    if (!access_token) {
      return NextResponse.json({ error: 'Unauthorized: Missing access token' }, { status: 401 });
    }

    // Initialize Supabase client with user's access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${access_token}`, // Attach user-specific token
          },
        },
      }
    );

    // Query the database
    const { data, error } = await supabase
      .from('your_table') // Replace with your table name
      .select('*')
      .eq('user_id', userId) // Example filter, adjust as needed
      .eq('session_id', sessionId); // Example filter, adjust as needed

    if (error) {
      console.error('Database query error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
    console.log('POST request to /api/pusher');
  const body = await req.json();
  const { channel, event, data } = body;

  try {
    console.log(`Triggering event ${event} on channel ${channel} with data:`, data);
    await pusher.trigger(channel, event, data);
    
    return new NextResponse(JSON.stringify({ 
      message: `Exercise triggered on ${channel}` 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch(error) {
    console.error("Error triggering Pusher event:", error);
    return new NextResponse(JSON.stringify({ 
      message: 'Failed to trigger event' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}