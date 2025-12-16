import { useEffect, useState } from "react";
import api from "../api/api";

const AdminPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users").then(res => setUsers(res.data));
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {users.map(u => (
        <div key={u.id}>
          {u.name} – {u.role}
        </div>
      ))}
    </div>
  );
};

export default AdminPage;
