import { NextRequest, NextResponse } from "next/server";

// possibly rework to Redis for scaling
const connectedUsers = new Map<
  string, // lessonID
  Array<{ userID: string; userRole: string; sessionID: string }>
>();

/*



*/

export async function GET(req: NextRequest, { params }: { params: { lessonID: string } }) {
  const { lessonID } = params;

  if (!lessonID) {
    return NextResponse.json({ error: "Missing lessonID" }, { status: 400 });
  }

  const users = connectedUsers.get(lessonID) || [];
  return NextResponse.json({ users });
}


export async function POST(req: NextRequest) {
  try {
    const { userID, userRole, sessionID, lessonID } = await req.json();

    if (!userID || !userRole || !sessionID || !lessonID) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const users = connectedUsers.get(lessonID) || [];

    if (!users.find((user) => user.sessionID === sessionID)) {
      users.push({ userID, userRole, sessionID });
      connectedUsers.set(lessonID, users);
    }

    return NextResponse.json({ message: "User added successfully" });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
