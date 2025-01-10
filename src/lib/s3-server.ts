import AWS from 'aws-sdk'
import toast from 'react-hot-toast'
import fs from 'fs'

export async function downloadFromS3(fileKey: string){ //from local computer
    try {
       AWS.config.update({
                   credentials: { 
                       accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
                       secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY || ""
                   },
               })
       
               const s3 = new AWS.S3({
                   params: {
                       Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
                   },
                   region: 'us-east-1'
               })

               const params = {
                Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
                Key: fileKey,
            }
            const fileObj = await s3.getObject(params).promise();
            const file_name = `/tmp/pdf-${Date.now()}.pdf` //download into our file syyst
            fs.writeFileSync(file_name, fileObj.Body as Buffer)
            return file_name;
            
    } catch (e) {
        toast.error("Cannot obtain file")
        return null;
    }
}