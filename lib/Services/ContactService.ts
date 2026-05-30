import ContactModel from "../DB/Models/Contactmodel";
import { connectDB } from "../DB/dbconfig";
import { NextResponse } from "next/server";

export const submitContact = async (contactData: { name: string; email: string; subject: string; message: string }) => {
  try {
    await connectDB();
    const { name, email, subject, message } = contactData;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const newContact = await ContactModel.create({
      name,
      email,
      subject,
      message,
    });

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully!", data: newContact },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
};
