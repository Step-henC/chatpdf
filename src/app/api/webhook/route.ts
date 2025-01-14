//webhook stripe returns

import Stripe from "stripe"
import {stripe} from '@/lib/stripe'
import { NextResponse } from "next/server"
import { saveSubscription, updateStripeSubscription } from "@/lib/db"

export async function POST(req: Request) {
    const body = await req.text() 
    if (!body) {
        throw new Error("Missing request for Stripe")
    }
    const signature = await req.headers.get('stripe-signature') as string

    if (!signature) {
        throw new Error('no stripe signature')
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SIGNING_SECRET!);

    } catch (e) {
        if (e instanceof Error) {
            console.log(e)
            return NextResponse.json({error: 'webhook error'}, {status: 400})
        }
        console.log(e)
        return NextResponse.json({error: 'webhook error'}, {status: 400})
    }


    const session = event.data.object as Stripe.Checkout.Session

    // if new subscription, save to database
    if (event.type === 'checkout.session.completed') {
        console.log('COMPOLEJFK')

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

        if (!session?.metadata?.userId) {
            return NextResponse.json({error: 'no user id'}, {status: 400})
        }

        await saveSubscription(
            session.metadata.userId,
            subscription.id,
            subscription.customer as string,
            subscription.items.data[0].price.id,
            new Date(subscription.current_period_end *1000)
        )
        console.log("WE GOOD!")
    }

    if (event.type === 'invoice.payment_succeeded') {
        console.log('INCOICE')
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        await updateStripeSubscription(
            subscription.items.data[0].price.id, 
            new Date(subscription.current_period_end *1000), 
            subscription.id
        )
        console.log("WE PAID!")

    }

    // if we do not return 200 status, stripe will think somehting is wrong and 
    // keep sending webhook
    return NextResponse.json(null, {status: 200})

}