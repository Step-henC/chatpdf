import {OpenAIApi, Configuration} from 'openai-edge' //allows us to run pincone on vercel edge runtime


const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY!,

})

const openai = new OpenAIApi(config)


export async function getEmbeddings(text: string) {
    try {

        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: text.replace(/\n/g, '')
        })

        const embedding = await response.json();
        return embedding.data[0].embedding as number[];

    } catch (e) {
        console.log("ERROR For openai embeddings", e)
        throw e;
    }
}