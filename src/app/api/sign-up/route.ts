import dbConnect from "@/lib/dbConnect";
import {UserModel} from "@/model/User";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {

    const { username, email, password } = await request.json();
    const existingUserVerifiedByUserName = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUserName) {
      return Response.json(
        {
          success: false,
          message: "User with this username already exists",
        },
        { status: 400 }
      );
    }
    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User with this email already exists",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcryptjs.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCodeExpiry = new Date(
          new Date().getTime() + 60 * 60 * 1000
        );
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      console.log("expiryDate", expiryDate);
      console.log("verifyCode", verifyCode);
      console.log("hashedPassword", hashedPassword);

      const newUser = new UserModel({
        username: username,
        email: email,
        password: hashedPassword,
        verifyCodeExpiry: expiryDate,
        verifyCode: verifyCode,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }
    //send verification email
    const emailResponse: any = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User created successfully, Please verify your email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating user", error);
    return Response.json(
      {
        success: false,
        message: "Error creating user",
      },
      { status: 500 }
    );
  }
}
