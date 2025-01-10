"use client"
//requires interactivity and usestate

import { useState } from 'react'
import { uploadToS3 } from '@/lib/s3'
import { useMutation } from '@tanstack/react-query'
import { Inbox, Loader2 } from 'lucide-react'
import {useDropzone} from 'react-dropzone' //creates file upload/drop utility for us
import axios from 'axios'
import toast from 'react-hot-toast'

const FileUpload = () => {
    const [uploading, setUploading] = useState(false) //true when uploading to s3
    const {mutate, isPending} = useMutation({ //isLoading is true when uploading file to my backend api
        mutationFn: async ({file_key, file_name}: {file_key: string, file_name: string}) => {
            const response = await axios.post('/api/create-chat', {
                        file_key, file_name
            })
            return response.data;
        }
})
    const {getRootProps, getInputProps} = useDropzone({
        accept: {'application/pdf': [".pdf"]},
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0]

            if (file.size > 10 * 1024 * 1024) {
                //do not upload to s3 if bigger than 10MB
                toast.error("File too large. Must be below 10 MB")
                return;
            }

            try {
                setUploading(true)
                const data = await uploadToS3(file);

                if (!data?.file_key || !data?.file_name) {
                    toast.error("something went wrong")
                    return;
                }
                mutate(data, {
                    onSuccess: (data) => {toast.success("success!"); console.log(data)},
                    onError: () => toast.error("Error creating chat")
                }) //send data to our api chat server
            } catch (error) {
                toast.error("Cannot upload file")
            } finally {
                setUploading(false)
            }
        }
    })
    return (
        <div className='p-2 bg-white rounded-xl'>
            <div {...getRootProps({
                className: "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col"
})}>
                <input {...getInputProps()}/>
                {uploading || isPending ? (
                    <>
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin"/>
                    <p className="mt-2 text-sm text-slate-400">Spilling tea to GPT...</p>
                </>) : (  <>
                <Inbox className='w-10 h-10 text-blue-500'/>
                <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
                </>)}
              
            </div>
        </div>
    )
}

export default FileUpload;