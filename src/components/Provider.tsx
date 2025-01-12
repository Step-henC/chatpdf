"use client"
import React from 'react'
import {QueryClientProvider, QueryClient} from '@tanstack/react-query'


type Props = {
children: React.ReactNode
}

const queryClient = new QueryClient();
const Provider = ({children}: Props) => {

    return (
        // eslint-disable-next-line react/no-children-prop
        <QueryClientProvider client={queryClient} children={children}>

        </QueryClientProvider>
    )
}

export default Provider;