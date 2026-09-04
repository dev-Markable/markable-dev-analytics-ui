import './styles.css';

export { TasksTimeline } from './ui/TasksTimeline';
// Группировка коммитов по карточкам Kaiten нужна и странице сравнения — там
// показываются задачи каждого из выбранных разработчиков.
export { groupCommitsByTask, ORPHAN_KEY, type TaskGroup } from './lib/group-commits';
