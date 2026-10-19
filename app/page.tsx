import Storefront from './storefront';
import {catalog} from './server';
import type {Product,Offer} from './catalog';
export const dynamic='force-dynamic';
export default async function Page(){const data=await catalog();return <Storefront initial={{...data.catalog,products:data.catalog.products.filter((p:Product)=>p.published),offers:data.catalog.offers?.filter((o:Offer)=>o.active)}}/>}
