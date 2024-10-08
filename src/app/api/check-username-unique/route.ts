import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import {z} from "zod";
import  {usernameValidation} from "@/schemas/signUpScheme";
import { use } from "react";

const UsernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET(request: Request) {
    await dbConnect();
    try {
        const {searchParams} = new URL(request.url);
        const queryParam = { username: searchParams.get("username") };
        // validate with zod 
        const result = UsernameQuerySchema.safeParse(queryParam);
        console.log("result", result);
        if(!result.success) {
            const usernameError = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameError.length>0 ? usernameError.join(', ') : "Invalid username"
            }, {status: 400});
        }
        const {username} = result.data;
        const existingVerifiedUser = await UserModel.findOne({username: username, isVerified: true});
        if (existingVerifiedUser) {
          return Response.json(
            {
              success: false,
              message: "Username already taken",
            },
            { status: 400 }
          );
        } 
        return Response.json({
            success: true,
            message: "Username is available"
        });
    } catch (error) {
        console.log("Error in checking username", error);
        return  Response.json({
            success: false,
            message: "Error in checking username"
        }, {status: 500});
    }
}