// index.tsx

import Head from "next/head";
import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from "react";
// import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps, GetServerSidePropsContext } from 'next'
import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface AuthProps {
  role?: string;
  accessToken?: string;
  error?: string;
}

// export const getServerSideProps: GetServerSideProps<AuthProps> = withPageAuthRequired({
//   async getServerSideProps(ctx: GetServerSidePropsContext) {
//     try {
//       const session = await getSession(ctx.req, ctx.res);
//       if (!session || !session.user) {
//         return {
//           redirect: {
//             destination: '/api/auth/login',
//             permanent: false,
//           },
//         };
//       }

//       const accessToken = session.accessToken;
//       if (!accessToken) {
//         throw new Error('Access token not found in session');
//       }

//       const response = await fetch('http://localhost:8000/api/check_user', {
//         method: 'GET',
//         headers: {
//           "Authorization": `Bearer ${accessToken}`,
//         },
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       const role = data.user_type;

//       if (!role || role === "no type") {
//         return {
//           redirect: {
//             destination: '/diagnostic',
//             permanent: false,
//           },
//         };
//       }

//       const roleRedirects: { [key: string]: string } = {
//         "ad": '/admin',
//         "in": '/instructor',
//         "st": '/learner',
//       };

//       if (role in roleRedirects) {
//         return {
//           redirect: {
//             destination: roleRedirects[role],
//             permanent: false,
//           },
//         };
//       }

//       return {
//         props: {
//           role: role || 'unknown',
//           accessToken,
//         },
//       };
//     } catch (error) {
//       console.error('Error in getServerSideProps:', error);
//       return {
//         props: {
//           error: 'An error occurred during authentication',
//         },
//       };
//     }
//   }
// // });
// export const getServerSideProps = withPageAuthRequired({
//   async getServerSideProps(ctx) {
//     const { req, res } = ctx;
//     const session = await getSession(req, res);
//     console.log(session);
//     if (!session) {
//       return {
//         redirect: {
//           destination: '/about',
//           permanent: false,
//         },
//       };
//     }

//     console.log(session.accessToken);
    
//     const options = {
//       method: 'GET',
//       // credentials: 'include',
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${session.accessToken}`, // Include the access token
//       },
//     };

//     try {

//       const response = await fetch('http://localhost:8000/api/get-user-role', options);
//       const roleType = await response.json();
//       if (roleType === "no type" ) {
//         // return {
//         //   props: {
//         //     role: roleType || 'unknown',
//         //     accessToken: session.accessToken,
//         //   },
//         // };
//         return {
//           redirect: {
//             destination: '/diagnostic',
//             permanent: false,
//           },
//         };
//       }
//       const role = roleType.role;
//       if (role === "ad") {
//         return {
//           redirect: {
//             destination: '/admin',
//             permanent: false,
//           },
//         };
//       } else if (role === "in") {
//         return {
//           redirect: {
//             destination: '/instructor',
//             permanent: false,
//           },
//         };
//       } else if (role === "st") {
//         return {
//           redirect: {
//             destination: '/learner',
//             permanent: false,
//           },
//         };
//       }
//       return {
//         props: {
//           role: role || 'unknown',
//           accessToken: session.accessToken,
//         },
//       };
//     } catch (error) {
//       console.log(error);
//     }
//   }
// });

// import { GetServerSideProps } from 'next';
// import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';

interface AuthProps {
  role?: string;
  accessToken?: string;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<AuthProps> = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { req, res } = ctx;
    const session = await getSession(req, res);
    
    if (!session) {
      return {
        redirect: {
          destination: '/about',
          permanent: false,
        },
      };
    }

    try {
      const response = await fetch('http://localhost:8000/api/get-user-role', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const roleType = await response.json();
      const role = roleType.role;

      if (role === "no type") {
        return {
          redirect: {
            destination: '/diagnostic',
            permanent: false,
          },
        };
      }

      const roleRedirects: { [key: string]: string } = {
        "ad": '/admin',
        "in": '/instructor',
        "st": '/learner',
      };

      if (role in roleRedirects) {
        return {
          redirect: {
            destination: roleRedirects[role],
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
      console.error('Error in getServerSideProps:', error);
      return {
        props: {
          error: 'An error occurred during authentication',
        },
      };
    }
  }
});

export default function Home({ role, accessToken, error }: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
    // console.log("here1")
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

// import { NextPage } from 'next';
// interface HomeProps {
//   role?: string;
//   accessToken?: string;
//   error?: string;
// }

// const Home: NextPage<HomeProps> = ({ role, accessToken, error }) => {
//   const { user, isLoading } = useUser();

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div>
//       <h1>Welcome, {user?.name}!</h1>
//       {role && <p>Your role is: {role}</p>}
//       {/* Rest of your component */}
//     </div>
//   );
// };

// export default Home;