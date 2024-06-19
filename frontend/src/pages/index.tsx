import Head from "next/head";
import { UseUser } from "@auth0/nextjs-auth0/dist/client/use-user";

export default function Home() {

  return (
    <>
        <Head>
          <title>Heu Learning</title>
          <meta name="description" content="Teach more English better" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/icon.ico" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
        </Head>
        
        <div >
          new index page for redirecting users based on role
        </div>
    </>
  );
}


