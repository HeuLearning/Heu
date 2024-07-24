import styles from './Hook.module.css';
import "animate.css/animate.compat.css"
import ScrollAnimation from 'react-animate-on-scroll';

export default function Hook() {
    return (
        <div className={styles.hook}>
            <h1 className={styles.hook_text}>Teach more English better.</h1>
            {/* <ScrollAnimation animateIn="rollIn" duration="0.8" offset="0"><svg viewBox="0 0 478 225" fill="none" xmlns="http://www.w3.org/2000/svg" className={["circle", styles.header_svg].join(' ')}>
                <path d="M165.946 36.018C83.648 41.475 2.43455 67.8824 9.87595 133.6C17.3174 199.317 157.689 222.87 264.682 212.852C371.676 202.835 445.849 188.444 466.728 111.244C487.606 34.0439 315.367 5.93389 197.879 9.75876" stroke="#69BBFE" stroke-width="18.1099" stroke-linecap="round"/>
            </svg></ScrollAnimation>
            <ScrollAnimation animateIn="bounceInDown" offset="0"><svg viewBox="0 0 415 49" fill="none" xmlns="http://www.w3.org/2000/svg" className={["squiggle", styles.header_svg].join(' ')}>
                <path d="M407 21.7503C402.101 19.3589 399.414 7.99997 374.382 7.99997C349.35 7.99997 343.281 36.2047 320.525 36.2047C297.768 36.2047 297.768 11.4311 268.943 11.4311C240.118 11.4311 234.808 40.9875 209.776 40.9875C184.743 40.9875 168.814 10.928 143.023 11.4311C117.232 11.9341 108.129 41.0134 83.8555 41C59.5818 40.9867 50.4791 -7.41402 8.00001 14.8767" stroke="#F59A0D" stroke-width="16" stroke-linecap="round"/>
            </svg></ScrollAnimation> */}
            <svg viewBox="0 0 347 165" fill="none" className={["circle", styles.header_svg].join(' ')} xmlns="http://www.w3.org/2000/svg">
                <path d="M121.287 28.1163C62.548 32.0111 4.58379 50.8588 9.89492 97.763C15.206 144.667 115.393 161.477 191.757 154.328C268.121 147.178 321.061 136.907 335.962 81.8073C350.864 26.7073 227.932 6.64448 144.078 9.37439" stroke="#69BBFE" stroke-width="18.1099" stroke-linecap="round"/>
            </svg>
            <svg viewBox="0 0 342 47" fill="none" className={["squiggle", styles.header_svg].join(' ')} xmlns="http://www.w3.org/2000/svg">
                <path d="M332 21.2503C328.046 19.2937 325.878 9.99997 305.677 9.99997C285.475 9.99998 280.578 33.0766 262.213 33.0766C243.848 33.0766 243.848 12.8072 220.586 12.8072C197.323 12.8072 193.038 36.9898 172.837 36.9898C152.635 36.9898 139.779 12.3957 118.966 12.8073C98.1521 13.2188 90.8061 37.011 71.2167 37C51.6274 36.9891 44.2814 -2.61148 10 15.6264" stroke="#F59A0D" stroke-width="18.1099" stroke-linecap="round"/>
            </svg>
        </div>
    );
}