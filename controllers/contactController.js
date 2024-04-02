const Contact = require("../models/contactModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const responseCreate = async (id) => {
  const primaryContact = await Contact.findById(id);

  const secondaryContacts = await Contact.find({ linkedId: id });

  const phoneNumber = new Set([
    primaryContact.phoneNumber,
    ...secondaryContacts.map((contact) => contact.phoneNumber),
  ]);
  const response = {
    primaryContactId: primaryContact.id,
    emails: [
      primaryContact.email,
      ...secondaryContacts.map((contact) => contact.email),
    ],
    phoneNumbers: [...phoneNumber],
    secondaryContactIds: secondaryContacts.map((contact) => contact.id),
  };

  return response;
};

const registerContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    const existedSameContact = await Contact.findOne({
      $and: [{ email }, { phoneNumber }],
    });

    if (existedSameContact) {
      const response =
        existedSameContact.linkPrecedence === "primary"
          ? await responseCreate(existedSameContact._id)
          : await responseCreate(existedSameContact.linkedId);
      return res.status(200).json(new ApiResponse(response));
    }

    let existedContact1 = await Contact.findOne({ email: email });
    let existedContact2 = await Contact.findOne({ phoneNumber: phoneNumber });

    if (
      existedContact1 &&
      existedContact2 &&
      existedContact1._id != existedContact2._id
    ) {
      if (existedContact1.createdAt > existedContact2.createdAt) {
        const temp = existedContact1;
        existedContact1 = existedContact2;
        existedContact2 = temp;
      }
      existedContact2.linkPrecedence = "secondary";
      existedContact2.linkedId = existedContact1._id;

      await existedContact2.save();

      const response = await responseCreate(existedContact1._id);

      return res.status(200).json(new ApiResponse(response));
    }

    const existedContact = await Contact.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existedContact && (email == null || phoneNumber == null)) {
      const response = await responseCreate(
        existedContact.linkedId ? existedContact.linkedId : existedContact._id
      );

      return res.status(200).json(new ApiResponse(response));
    }

    const contact = existedContact
      ? await Contact.create({
          email: email,
          phoneNumber: phoneNumber,
          linkedId: existedContact._id,
          linkPrecedence: "secondary",
        })
      : await Contact.create({
          email: email,
          phoneNumber: phoneNumber,
          linkedId: null,
          linkPrecedence: "primary",
        });

    const createdContact = await Contact.findById(contact._id).select(
      "-createdAt -updatedAt -__v"
    );

    if (!createdContact) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    const response = await responseCreate(
      existedContact ? existedContact._id : createdContact._id
    );

    res.status(200).json(new ApiResponse(response));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(null, "Internal Server Error"));
  }
};

module.exports = registerContact;