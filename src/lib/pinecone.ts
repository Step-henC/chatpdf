import {Pinecone } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server'
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf"

let pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
    maxRetries: 5,
})
type PDFPage = { // saw this when console logging result of PDFLoader
    pageContent: string,
    metadata: {
        loc: {pageNumber: number}
    }
}
export async function loadS3IntoPinecone(fileKey: string){
    //obtain pdf -> download and read from pdf
    console.log("downloading s3 into fileysystem")
    const file_name = await downloadFromS3(fileKey)

    //load file name path into pdf loader to parse into text
    if (!file_name) {
        throw new Error("Cannot download from s3")
    }
    const pages = (await new PDFLoader(file_name).load()) as PDFPage[]
    return pages;
}