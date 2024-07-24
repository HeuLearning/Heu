import styles from "./Navbar.module.css";
import Logo from "./Logo";
import NavButtons from "./NavButtons";
import LanguageSelector from "./LanguageSelector";
import DropDownSelector from "./DropDownSelector";
import ProfilePic from "./ProfilePic";
import XButton from "./XButton";
import BackButton from "./BackButton";

export default function Navbar() {
  return (
    <div className={styles.navbar}>
      <div className={styles.navbar_left}>
        <Logo />
        <div className={styles.navbar_buttons}>
          <NavButtons
            buttonOptions={["Dashboard", "Training"]}
            selectedButton="Dashboard"
          />
        </div>
      </div>
      <div className={styles.navbar_right}>
        <LanguageSelector
          className="drop-shadow-sm"
          selected="EN"
          allOptions={[
            ["English", "EN"],
            ["Spanish", "ES"],
            ["Portuguese", "PT"],
          ]}
        />
        <DropDownSelector
          selected="blah1"
          allOptions={["blah1", "blah2", "blah3"]}
        />
        <ProfilePic />
      </div>
    </div>
  );
}
