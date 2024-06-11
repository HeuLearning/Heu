import styles from "./Body.module.css";

export default function Body() {
    return (
        <div className={styles.body}>
            <p>We're a group of Princeton math & computer science students looking to dramatically increase the supply and effectiveness of in-person adult English instruction. 26.5 million US residents don't know English, and while we know ESL can transform the lives of non-English speakers, fewer than 350 thousand access it.<sup className={styles.footnote}>1</sup></p>
            <br></br>
            <p>We're building a network of English as a Second Language (ESL) programs that employ blended learning approaches to</p>
            <br></br>
            <ol className="list-decimal">
                <li>Standardize teaching practices and collect learning data</li>
                <li>Employ these data to find increasingly effective & scalable ways of running these programs</li>
                <li>Scale these programs hard</li>
            </ol>
            <br></br>
            <p>If you want to help/donate/talk about the project or start your own ESL program, please reach out at contact@heulearning.org.</p>
            <br></br>
            <p>So much love,</p>
            <p>Heu</p>
            <br></br>

            <sup id="fn1" className={styles.footnote}>1. <a href="https://pubs.aeaweb.org/doi/pdfplus/10.1257/pol.20210336" target="_blank" className={styles.footnote}>Heller & Mumma (2023)</a></sup>
        </div>
    );
}