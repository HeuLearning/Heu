import Head from "next/head";
import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from "react";
// import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation'

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { req, res } = ctx;
    const session = await getSession(req, res);
    console.log(session);
    if (!session) {
      return {
        redirect: {
          destination: '/about',
          permanent: false,
        },
      };
    }

    console.log(session.accessToken);
    
    const options = {
      method: 'GET',
      // credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    try {

      const response = await fetch('http://localhost:8000/api/get-user-role', options);
      const roleType = await response.json();
      if (roleType === "no type" ) {
        return {
          props: {
            role: roleType || 'unknown',
            accessToken: session.accessToken,
          },
        };
        return {
          redirect: {
            destination: '/diagnostic',
            permanent: false,
          },
        };
      }
      const role = roleType.role;
      if (role === "ad") {
        return {
          redirect: {
            destination: '/admin',
            permanent: false,
          },
        };
      } else if (role === "in") {
        return {
          redirect: {
            destination: '/instructor',
            permanent: false,
          },
        };
      } else if (role === "st") {
        return {
          redirect: {
            destination: '/learner',
            permanent: false,
          },
        };
      }
      return {
        props: {
          role: role || 'unknown',
          accessToken: session.accessToken,
        },
      };
    } catch (error) {
      console.log(error);
    }
  }
});


export default function Home({ role, accessToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter(); 
  const updateUser = async (newRole: string): Promise<void> => {
    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`, // Include the access token
      },
      body: JSON.stringify({
        purpose: "change role",
        role: newRole,
      }),
    };
    console.log("here1")
    await fetch('http://localhost:8000/api/user', options);
    switch(newRole) {
      case "ad":
        router.push("/admin");
        break;
      case "in":
        router.push("/instructor");
        break;
      case "st":
        router.push("/learner");
        break;
      default:
        break
    }
  }

 
  return (
    <>
        <Head>
          <title>Heu Learning</title>
          <meta name="description" content="Teach more English better" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/icon.ico" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
        </Head>
        
        <div>
          <div><button onClick={() => updateUser("st")}>Register as a Learner</button></div>
          <div><button onClick={() => updateUser("in")}>Register as an Instructor</button></div>
          <div><button onClick={() => updateUser("ad")}>Request to be a Learning Center Administrator</button></div>
        </div>
    </>
  );
}


