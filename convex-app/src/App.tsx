import { useEffect, useState } from "react";
import { useAuth } from "@workos-inc/authkit-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import "./App.css";

function TasksApp() {
  const storeUser = useMutation(api.users.store);
  const [userStored, setUserStored] = useState(false);
  const [title, setTitle] = useState("");
  const tasks = useQuery(api.tasks.list, userStored ? {} : "skip");
  const create = useMutation(api.tasks.create);
  const update = useMutation(api.tasks.update);
  const remove = useMutation(api.tasks.remove);

  useEffect(() => {
    void storeUser().then(() => setUserStored(true));
  }, [storeUser]);

  if (!userStored || tasks === undefined) {
    return <div className="app">Loading tasks...</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>Tasks</h1>
        <p>Real-time task list powered by Convex</p>
      </header>

      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = title.trim();
          if (!trimmed) {
            return;
          }
          void create({ title: trimmed });
          setTitle("");
        }}
      >
        <input
          name="title"
          placeholder="New task"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(event) =>
                  void update({
                    taskId: task._id,
                    completed: event.target.checked,
                  })
                }
              />
              <span className={task.completed ? "completed" : undefined}>
                {task.title}
              </span>
            </label>
            <button
              type="button"
              onClick={() => void remove({ taskId: task._id })}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="empty">No tasks yet. Add your first one above.</p>
      )}
    </div>
  );
}

export default function App() {
  const { user, signIn, signOut, isLoading } = useAuth();

  if (isLoading) {
    return <div className="app">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="app auth">
        <h1>Convex Quickstart</h1>
        <p>Sign in to manage your tasks.</p>
        <button type="button" onClick={() => void signIn()}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <nav className="nav">
        <span>Signed in as {user.email ?? user.firstName ?? "User"}</span>
        <button type="button" onClick={() => void signOut()}>
          Sign out
        </button>
      </nav>
      <TasksApp />
    </div>
  );
}
