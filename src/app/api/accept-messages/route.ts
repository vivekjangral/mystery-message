import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }
  const userId = user._id;
  const { isAcceptingMessages } = await request.json();
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessages: isAcceptingMessages },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
          updatedUser,
        },
        { status: 401 }
      );
    } else {
      return Response.json(
        {
          success: true,
          message: "User messages preference updated successfully",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log("Error in accepting messages ", error);
    return Response.json(
      {
        success: false,
        message: "Error in accepting messages",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }
  const userId = user._id;
  try {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 }
      );
    }
    return Response.json(
      {
        success: true,
        isAcceptingMessages: existingUser.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in getting user messages preference ", error);
    return Response.json(
      {
        success: false,
        message: "Error in getting user messages preference",
      },
      { status: 500 }
    );
  }
}
