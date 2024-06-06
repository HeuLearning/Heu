import Head from "next/head";
import Header from "../../components/header"
import styles from "../styles/Analyze-Psellos.module.css"
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useAllAuthorTexts } from "./api/services/use-all-author-texts";
import Link from "next/link";

export default function AnalyzePsellos() {
  const { texts } = useAllAuthorTexts({

    url: `/api/data/alltexts`,
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    data: {
      author_id: 1
    }
  });

  return (
    <>
      <Head>
        <title>Logion</title>
      </Head>
      <main className={styles.main}>
        <Header></Header>
        <div className={styles.textsContainer}>
          <div className={styles.title}>Texts:</div>
          {texts && texts.map(t => <Link className={styles.link} href={`/psellos/${t.id}`} key={t.title}>{t.title}</Link>)}
        </div>
      </main>
    </>
  );
}


export const getServerSideProps = withPageAuthRequired();