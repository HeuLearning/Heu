import styles from "./Body.module.css";
import Hook from "./hook";

export default function Body() {
    return (
        <div className={styles.body}>
            <div>We're <div className={styles.boldText}>Heu Learning</div>. We're building a network of English as a Second Language (ESL) programs that employ blended learning approaches to provide more effective English instruction at scale.</div>
            <br></br>
            <div>In other words, we're trying to...</div>
            <br></br>
            <Hook />
            <br></br>
            <div>26.5 million US residents don't know English,<sup className={styles.footnote}>1</sup> and while studies have demonstrated the transformative impact of ESL on the lives of non‑English speakers,<sup className={styles.footnote}>2</sup> fewer than 350 thousand access it.<sup className={styles.footnote}>3</sup></div>
            <br></br>
            {/* <div>Our mission is to dramatically increase the <div className={styles.boldText}>supply</div> and <div className={styles.boldText}>effectiveness</div> of in‑person adult English instruction.</div> */}
            <div></div>
            
            
            <div>If interested in hearing more / starting your own program, please reach out to <a href="mailto:contact@heulearning.org" className={styles.link}>contact@heulearning.org</a>. <a href="https://givebutter.com/launch-heu-learning" target="_blank" className={styles.link}>Donate here!</a></div>
            <br></br>
            <p>So much love,</p>
            <p>Heu</p>
            <br></br>
            <hr className={styles.divider}></hr>
            <p id="fn1" className={styles.footnote_link}>1. <a href="https://data.census.gov/mdat/#/search?ds=ACSPUMS1Y2022&title=Age%20by%20year%20of%20entry%20of%20noncitizens" target="_blank" className={styles.footnote_link}>U.S. Census Bureau, <i>2004-2022 1-Year Estimates Public Use Microdata Samples</i>, 2022.</a></p>
            <p id="fn2" className={styles.footnote_link}>2. <a href="https://nces.ed.gov/programs/digest/d22/tables/dt22_507.20.asp?current=yes" target="_blank" className={styles.footnote_link}>National Center for Education Statistics, <i>Participants in State-Administered Adult Basic Education, Adult Secondary Education, and English Language Acquisition Programs</i>, 2022.</a></p>
            <p id="fn3" className={styles.footnote_link}>3. <a href="https://pubs.aeaweb.org/doi/pdfplus/10.1257/pol.20210336" target="_blank" className={styles.footnote_link}>Heller and Mumma, <i>Immigrant Integration in the United States: The Role of Adult English Language Training</i>, 2023.</a></p>

        </div>
    );
}