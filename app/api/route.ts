import { connectDB } from "@/lib/DB/dbconfig";
import { NextResponse } from "next/server";




export async function GET(){

    await connectDB()

    return NextResponse.json({
        status:"success",
        data:"welcome to nextjs project"
    })
}