import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const res = await fetch(process.env.INTERNAL_API_URL + "/connect/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.INTERNAL_API_TOKEN}`
            },
            body: JSON.stringify(body),
            cache: "no-store"
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Internal service error" },
                { status: res.status }
            );
        }

        const data = await res.json();

        return NextResponse.json({
            success: true,
            data
        });

    } catch (err) {
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}