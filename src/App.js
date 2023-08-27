import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import { account, client, databases } from "./utils/appwrite";
import { AppwriteException, ID, Permission, Role } from "appwrite";

function App() {
  const [todos, setTodos] = useState([]);
  const [user, setUser] = useState();

  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      console.log(account);
      global.account = account;
      try {
        const response = await account.get();
        setUser(response);
        console.log(response);
        client.subscribe(
          [
            "databases.64eb103154c464fe4931.collections.64eb10399981ed36e86c.documents",
            // "databases.64eb103154c464fe4931.collections.64eb10399981ed36e86c.documents.*.create",
            // "databases.64eb103154c464fe4931.collections.64eb10399981ed36e86c.documents.*.update",
            // "databases.64eb103154c464fe4931.collections.64eb10399981ed36e86c.documents.*.delete",
          ],
          updateTodos
        );
        updateTodos();
      } catch (e) {
        if (e instanceof AppwriteException && e.code === 401) {
          return account.createOAuth2Session(
            "google",
            "http://localhost:3000/"
          );
        }
        throw e;
      }
    })();
  }, []);

  const updateTodos = async () => {
    const res = await databases.listDocuments(
      "64eb103154c464fe4931",
      "64eb10399981ed36e86c"
    );
    console.log(res);
    setTodos(res.documents || []);
    inputRef.current.value = "";
  };

  const addTodo = async () => {
    await databases.createDocument(
      "64eb103154c464fe4931",
      "64eb10399981ed36e86c",
      ID.unique(),
      {
        completed: false,
        text: inputRef.current.value,
        owner: user["$id"],
      },
      [
        Permission.read(Role.user(user["$id"])),
        Permission.write(Role.user(user["$id"])),
        Permission.update(Role.user(user["$id"])),
        Permission.delete(Role.user(user["$id"])),
      ]
    );
  };

  const deleteTodo = (id) => () =>
    databases.deleteDocument(
      "64eb103154c464fe4931",
      "64eb10399981ed36e86c",
      id
    );

  const updateTodo = (id, current) => () => {
    databases.updateDocument(
      "64eb103154c464fe4931",
      "64eb10399981ed36e86c",
      id,
      { completed: !current.completed }
    );
  };

  return (
    <div className="App">
      <h1>Todo App pocketbase</h1>

      <div className="container">
        <div id="newtask">
          <input type="text" placeholder="Task to be done.." ref={inputRef} />
          <button onClick={addTodo}>Add</button>
        </div>
        <div id="tasks">
          {todos.map((todo, index) => (
            <div
              key={index}
              className={todo.completed ? "task completed" : "task"}
            >
              <span id="taskname" onClick={updateTodo(todo.$id, todo)}>
                {todo.text}
              </span>
              <button className="delete" onClick={deleteTodo(todo.$id)}>
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
