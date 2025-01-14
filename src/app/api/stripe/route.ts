// /api/stripe

import { getSubscribedUserById } from "@/lib/db";
import { stripe } from "@/lib/stripe";

import { currentUser, auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server";


const return_url = process.env.NEXT_BASE_URL! + '/'


export async function GET() {

    try {
        const {userId} = await auth();
        const user = await currentUser();

        if (!userId) {
            return NextResponse.json({error: 'unauthorized'}, {status: 401})
        }

        const _userSubscriptions = await getSubscribedUserById(userId)

        if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
            //trying to cancel at the billing portal

            const stripeSession = await stripe.billingPortal.sessions.create({
                return_url: return_url,
                customer: _userSubscriptions[0].stripeCustomerId
            })
            return NextResponse.json({url: stripeSession.url})

        }

        //user's first time trying to subscribe
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: return_url,
            cancel_url: return_url,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            customer_email: user?.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price_data: {
                        currency: 'USD',
                        product_data: {
                            name: 'ChatPDF Pro',
                            description: "Unlimited PDF Sessions"
                        },
                        unit_amount: 2000,
                        recurring: {
                            interval: 'month'
                        }
                    },
                    quantity: 1,
                }
            ],
            metadata: {userId}, //need userID for after transaction stripe returns a webhook and we need to know who did the transaction

        })

        return NextResponse.json({url: stripeSession.url})

    } catch (e) {
        console.log(e)
        return NextResponse.json({error: "cannot complete stripe request"}, {status: 500})
    }
}