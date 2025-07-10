let users = [];

export const addUser = async ({ user_id, socket_id }) => {
  // find a user and make him online

  !users.some((user) => user.user_id === user_id) && users.push({ user_id, socket_id });

  return users;
};

export const removeUser = async ({ socket_id }) => {
  users = users.filter((user) => user.socket_id !== socket_id);
  return users;
};

export const getUser = async ({ user_id }) => {
  let user = users.find((user) => user.user_id === user_id);

  return user;
};
