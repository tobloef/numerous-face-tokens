import MainRoutes from "./shared/MainRoutes";
import Navbar from "./shared/Navbar";
import styles from "./App.module.css";

const App = () => {
  return <div className={styles.app}>
    <Navbar/>
    <MainRoutes/>
  </div>;
}

export default App
