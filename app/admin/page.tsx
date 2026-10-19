import Admin from './panel';
import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();if(!user)return <main className="auth-page"><img src="/images/shop-logo.png" alt="Nur Dress Gallary"/><div className="eyebrow">AUTHORIZED TEAM ONLY</div><h1>Your boutique,<br/><em>beautifully managed.</em></h1><p>Sign in to access catalog management. A shop role is required after sign-in.</p><a className="primary" href={chatGPTSignInPath('/admin')} target="_top">Sign in with ChatGPT →</a><a className="text-link" href="/">← Back to storefront</a></main>;return <Admin email={user.email}/>}
