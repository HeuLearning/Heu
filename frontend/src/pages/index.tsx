import Head from "next/head";
import { Inter } from "next/font/google";

import Header from "../../components/header";
import Body from "../../components/body";
import Footer from "../../components/footer";
import Hook from "../../components/hook";
import styles from "../styles/Home.module.css";

import { useState, useEffect } from 'react';

import 'aos/dist/aos.css';
import AOS from 'aos';

import "animate.css/animate.compat.css"
import ScrollAnimation from 'react-animate-on-scroll';

export default function Home() {

    useEffect(() => {
      AOS.init();
    }, []);

  return (
    <>
        <Head>
          <title>Heu Learning</title>
          <meta name="description" content="Teach more English better" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/icon.ico" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
        </Head>
        
        <div className={styles.background}>
          <Header />
          <Body />
          <Footer />
        </div>
    </>
  );
}


