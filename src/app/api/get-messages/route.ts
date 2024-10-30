import dbConnect from "@/lib/dbConnect";
import { UserModel, MessageModel, Message } from "@/models/User.model";
import { NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return NextResponse.json(
      { message: "Unauthorized access. Please log in." },
      { status: 401 }
    );
  }

  const username = user.username;

  try {
    const userWithMessages = await UserModel.findOne({ username }).populate({
      path: "messages",
      options: { sort: { createdAt: -1 } },
    });

    if (!userWithMessages) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    console.log(userWithMessages);
   
    
    return NextResponse.json(
      { messages: userWithMessages.messages },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "An error occurred while fetching messages.",
      },
      { status: 500 }
    );
  }
}
