// import conversationModel from '../models/messages/conversationModel.js';
// import messageModel from '../models/messages/messageModel.js';
// import { addUser, getUser, removeUser } from '../services/messages/socketFunction.js';

// export function socketBlock({ io }) {
//   io.on('connection', (socket) => {
//     // user joinin the conversation
//     socket.on('add_user', async ({ user_id }) => {
//       const socket_id = socket.id;
//       const users = await addUser({ user_id, socket_id });
//       io.emit('get_users', users);
//     });

//     // let us chat
//     socket.on('send_messages', async ({ sender_id, receiver_id, conversation_id, text, _id }) => {
//       let user = await getUser({ user_id: receiver_id });
//       let me = await getUser({ user_id: sender_id });

//       const conversation = await conversationModel.findById(conversation_id);

//       if (conversation) {
//         conversation.lastText = text;

//         await conversation.save();
//       }

//       await messageModel.create({
//         conversation_id,
//         sender_id,
//         text
//       });

//       if (user) {
//         io.to(me.socket_id)
//           .to(user.socket_id)
//           .emit('get_message', { receiver_id, sender_id, text, _id });
//       } else {
//         io.to(me.socket_id).emit('get_message', { receiver_id, sender_id, text, _id });
//       }
//     });

//     socket.on('disconnect', async () => {
//       await removeUser({ socket_id: socket.id });
//     });
//   });
// }
