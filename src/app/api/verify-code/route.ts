import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User";


export async function POST(request: Request) {
  await dbConnect();
  try {
    const {username, code} = await request.json();
    const decodedusername = decodeURIComponent(username);

    const existingUser = await UserModel.findOne({username: decodedusername});
    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }
    const isCodeValid = existingUser.verifyCode === code;
    const isCodeExpired = new Date(existingUser.verifyCodeExpiry) > new Date();

    if (isCodeValid  && isCodeExpired) {
      existingUser.isVerified = true;
      await existingUser.save();
      return Response.json(
        {
          success: true,
          message: "User verified successfully",
        },
        { status: 200 }
      ); 
    } else if (!isCodeExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code has expired Please sign up again",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Invalid verification code",
        },
        { status: 400 }
      );
    }

    
  } catch (error) {
    console.log("Error in verifying user ", error);
    return Response.json(
      {
        success: false,
        message: "Error in verifying  username",
      },
      { status: 500 }
    );
  }
}