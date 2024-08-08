import styles from "./Header.module.css";

// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {name: string}; /* use `interface` if exporting so that consumers can extend */

// Easiest way to declare a Function Component; return type is inferred.

const Header = () => (
    <>
        <h1 className={styles.header_text}>Hi!</h1>
        <svg className={styles.line} viewBox="0 0 160 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M159.606 8.50938C159.566 12.5162 156.291 15.6694 152.291 15.5522C100.632 14.0392 35.4351 23.3522 9.30163 28.2141C5.38331 28.9431 1.55646 26.3387 0.754114 22.397C-0.0482315 18.4554 2.47776 14.6691 6.39608 13.9401C32.9339 9.00299 99.2832 -0.514478 152.438 1.04235C156.437 1.15948 159.647 4.50259 159.606 8.50938Z" fill="#AD73CE"/>
        </svg>
    </>
);

export default Header;
