import React from "react";
import {Route, Routes} from "react-router-dom";
import ApplBarComponent from "./component/ApplBarComponent.jsx";
import MainPage from "./pages/MainPage.jsx";


function App() {
    return (
        <React.Fragment>
            <ApplBarComponent/>
            <MainPage/>
            {/*<Routes>*/}
            {/*    <Route path="/" Component={MainPage}/>*/}
            {/*</Routes>*/}
        </React.Fragment>
    );
}

export default App;
