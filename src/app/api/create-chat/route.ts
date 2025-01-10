import { NextResponse } from "next/server"

// need @tanstack/react-query to send file_key to backend when we upload to S3
//local to server queries
export async function POST(req: Request, res: Response){
try {
    const body = await req.json()
    const {file_key, file_name} = body;
    return NextResponse.json({message: 'success'})

} catch (e) {
    console.log(e)
    return NextResponse.json({status: 500, error: "internal server error"})
}
}