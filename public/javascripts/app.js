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
  },
  {
    id: 3,
    full_name: "Bugs Bunny",
    email: "bugs@bunny.com",
    phone_number: "12345678901",
    tags: ["work", "school", "friend"],
  },
  {
    id: 4,
    full_name: "Wiley Coyote",
    email: "wiley@coyote.com",
    phone_number: "12345678901",
    tags: null,
  },
  {
    id: 5,
    full_name: "Tweety Bird",
    email: "tweety@bird.com",
    phone_number: "12345678901",
    tags: null,
  }
];

$(() => {
  let contactsTemplate = Handlebars.compile($('#contacts').html());
  $('body').append(contactsTemplate({contacts}));
});