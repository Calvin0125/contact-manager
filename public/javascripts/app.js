let contacts = [
  {
    id: 1,
    full_name: "Donald Duck",
    email: "donald@duck.com",
    phone_number: "12345678901",
    tags: ["work", "school"],
  },
  {
    id: 2,
    full_name: "Daffy Duck",
    email: "daffy@duck.com",
    phone_number: "12345678901",
    tags: null,
  }
];

$(() => {
  let contactsTemplate = Handlebars.compile($('#contacts').html());
  $('body').append(contactsTemplate({contacts}));
});