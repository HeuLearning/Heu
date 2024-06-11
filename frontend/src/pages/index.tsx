import Head from "next/head";
import { Inter } from "next/font/google";

import Header from "../../components/header"
import Body from "../../components/body"
import styles from "../styles/Home.module.css"
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>Heu Learning</title>
        <meta name="description" content="Teach more English better" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.ico" />
      </Head>
      <div className={styles.background}>
        <Header />
        <Body />
      </div>
    </>
  );
}


