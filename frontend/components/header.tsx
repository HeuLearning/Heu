import styles from "./Header.module.css";
import Link from "next/link";
import { NavBar } from "./navigation/nav-bar";
import Image from 'next/image'
import logo from '../public/logion-logo.png'

// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = Record<string, never>; /* use `interface` if exporting so that consumers can extend */

// Easiest way to declare a Function Component; return type is inferred.
const Header = ({ }: AppProps) => (

  <div className={styles.header}>
    <Image
      src={logo}
      alt="Picture of the author"
      width={50}
      height={50}
    />
    <div className={styles.linkContainer}>
      <Link className={styles.link} href="/"><div>Home</div></Link>
      <Link className={styles.link} href="/analyze-psellos"><div>Analyze Psellos</div></Link>
      <NavBar/>
    </div>
  </div>
);

export default Header;
