import { Pinecone } from "@pinecone-database/pinecone";
import { convertToASCII } from "./utils";
import { getEmbeddings } from "./embeddings";

/* Get user input question for context for AI 
@input: query: user question
@input: fileKey namespace for pinecone vector db to search for specific pdf
@return 
*/
export async function getContext(query: string, fileKey: string) {
const queryEmbeddings = await getEmbeddings(query) 
const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey)

//only return matches greater than 70% match
const qualifyingDocs = matches.filter(match =>match?.score && match?.score > 0.7)

type Metadata = {
    text: string,
    pageNumber: number,
}

// get text from query
let docs = qualifyingDocs.map(match => (match.metadata as Metadata).text)

// rejoin all the chunks from query
// we will feed into openai prompt
//...to an extent, cutoff at 3000 chars
// so as not to break token limits
return docs.join('\n').substring(0, 3000)
}


/* Retrieve similar vector embeddings from pinecone db 
*/
export async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
})

const index = await pinecone.Index('chatpdf');

try {
    const namespace = convertToASCII(fileKey)
    const queryresult = await index.namespace(namespace).query({
        topK: 5,
        vector: embeddings,
        includeMetadata: true, 
    })

    return queryresult.matches || []
}catch (e) {
    console.log('error quering embeddings', e)
    throw e
}

}