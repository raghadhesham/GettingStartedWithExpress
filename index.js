const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json()); // to parse the JSON string to a JavaScript Object
const usersFile = path.join(__dirname, "users.json"); // to have a reliable absolute path

function readUsers() {
  const data = fs.readFileSync(usersFile, "utf-8");
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}
app.post("/users", (req, res) => {
  const { name, email, age } = req.body;
  if (!name || !email || !age) {
    return res.status(400).json({ message: "All fields are required." });
  }
  const users = readUsers();

  const emailExists = users.find((u) => u.email === email);
  if (emailExists) {
    return res.status(400).json({ message: "email already exists" });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    age,
  };
  users.push(newUser);
  writeUsers(users);
  res.status(201).json({ message: "User added successfully" });
});

app.patch("/users/:id", (req, res) => {
  const { id } = req.params;
  const { email, name, age } = req.body;
  const users = readUsers();
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }
  if (email && email !== user.email) {
    const emailExists = users.find((u) => u.email === email && u.id !== id);
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists!" });
    }
  }
  if (name) {
    user.name = name;
  }
  if (email) {
    user.email = email;
  }
  if (age) {
    user.age = age;
  }
  writeUsers(users);
  res.json({ message: "user updated" });
});
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  const users = readUsers();
  const filteredUsers = users.filter((u) => u.id !== id);

  if (users.length === filteredUsers.length) {
    return res.status(404).json({ message: "User not found" });
  }

  writeUsers(filteredUsers);
  res.json({ message: "User deleted" });
});
app.get("/users/getByName", (req, res) => {
  const { name } = req.query;

  const users = readUsers();
  const user = users.find((u) => u.name === name);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});
app.get("/users", (req, res) => {
  const users = readUsers();
  res.json(users);
});
app.get("/users/filter", (req, res) => {
  const minAge = Number(req.query.minAge);
  const users = readUsers();
  const filtered = users.filter((u) => u.age >= minAge);
  res.json(filtered);
});
app.get("/users/:id", (req, res) => {
  const { id } = req.params;

  const users = readUsers();
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
