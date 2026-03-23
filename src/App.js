import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ApplBarComponent from "./component/ApplBarComponent.jsx";
import ManualExport from "./pages/ManualExport.jsx";
import GitCommitsPage from "./pages/GitCommitsPage.jsx";
import GitBranchesPage from "./pages/GitBranchesPage.jsx";
import GitReposPage from "./pages/GitReposPage.jsx";
import GitUsersPage from "./pages/GitUsersPage.jsx";
import KaitenTasksPage from "./pages/KaitenTasksPage.jsx";
import KaitenBoardsPage from "./pages/KaitenBoardsPage.jsx";
import KaitenSprintsPage from "./pages/KaitenSprintsPage.jsx";
import KaitenTeamPage from "./pages/KaitenTeamPage.jsx";
import MainPage from "./pages/MainPage";
import WeeklyStatsPage from "./pages/WeeklyStatsPage.jsx";
import UserProfilePage from "./pages/UserProfilePage";


function App() {
    return (
        <BrowserRouter>
            <React.Fragment>
                <ApplBarComponent/>
                <Routes>
                    <Route path="/" Component={MainPage}/>
                    <Route path="/git/commits" Component={GitCommitsPage}/>
                    <Route path="/git/branches" Component={GitBranchesPage}/>
                    <Route path="/git/repos" Component={GitReposPage}/>
                    <Route path="/git/manual" Component={ManualExport}/>
                    <Route path="/git/users" Component={GitUsersPage}/>
                    <Route path="/git/weekly" Component={WeeklyStatsPage}/>
                    <Route path="/git/user/:email" Component={UserProfilePage}/>
                    <Route path="/kaiten/tasks" Component={KaitenTasksPage}/>
                    <Route path="/kaiten/boards" Component={KaitenBoardsPage}/>
                    <Route path="/kaiten/sprints" Component={KaitenSprintsPage}/>
                    <Route path="/kaiten/team" Component={KaitenTeamPage}/>
                </Routes>
            </React.Fragment>
        </BrowserRouter>
);
}
export default App;
