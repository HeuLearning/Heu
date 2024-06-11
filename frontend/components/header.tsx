import styles from "./Header.module.css";

// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {name: string}; /* use `interface` if exporting so that consumers can extend */

// Easiest way to declare a Function Component; return type is inferred.

const Header = () => (
  <div className={styles.header}>
    <h1>Hi!</h1>
  </div>
);

export default Header;
