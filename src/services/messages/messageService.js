import organizationBeneficiaryModel from '../../models/beneficiaries/organizationBeneficiaryModel.js';
import conversationModel from '../../models/messages/conversationModel.js';
import messageModel from '../../models/messages/messageModel.js';
import organizationModel from '../../models/organizationModel.js';

export const createConversation = async ({ user, beneficiary_id }) => {
  const checkExistingConvo = await existingConverstion({ user, beneficiary_id });

  if (checkExistingConvo) {
    return checkExistingConvo;
  }
  const data = {
    beneficiaries: [beneficiary_id],
    organization_id: user._id
  };

  const convo = await conversationModel.create(data);

  return convo;
};

const existingConverstion = async ({ user, beneficiary_id }) => {
  const findConvo = await conversationModel.findOne({
    organization_id: user._id,
    beneficiaries: { $all: [beneficiary_id] }
  });

  if (!findConvo) return false;

  return findConvo;
};

export const fetchAllConversations = async ({ user }) => {
  const conversation = await conversationModel
    .find({
      organization_id: user._id
    })
    .populate({
      path: 'beneficiaries',
      model: 'Organization_Member',
      select: { personal: 1, avatar: 1 }
    });

  return conversation;
};

export const fetchAllConversationMessages = async ({ conversation_id }) => {
  const messages = await messageModel.find({ conversation_id }).populate('sender_id');

  const convo = Promise.all(
    messages.map(async (sender) => {
      let sender_details = {};
      const checkBeneficiary = await organizationBeneficiaryModel.findById(sender.sender_id);
      if (checkBeneficiary) sender_details = checkBeneficiary;

      const checkOrganization = await organizationModel.findById(sender.sender_id);
      if (checkOrganization) sender_details = checkOrganization;

      sender = {
        ...sender.toJSON(),
        sender_details
      };

      return sender;
    })
  );

  return await convo;
};
