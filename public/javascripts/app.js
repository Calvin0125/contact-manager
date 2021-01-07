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

class App {
  constructor() {
    this.renderPage();
    this.bindEvents();
    this.filterFormTemplate = Handlebars.compile($('#filter-form-template').html());
  }

  renderPage() {
    let contactsTemplate = Handlebars.compile($('#contacts').html());
    $.get('/api/contacts', (contacts) => {
      contacts = this.separateTags(contacts);
      $('body').append(contactsTemplate({contacts}));
    });
  }

  separateTags(contacts) {
    contacts.forEach((contact) => {
      if (contact.tags) {
        contact.tags = contact.tags.split(',');
      }
    });
    return contacts;
  }

  bindEvents() {
    $('#add').on('click', $.proxy(this.handleAddClick, this));
    $('#filter').on('click', $.proxy(this.handleFilterClick, this));
    $('#cancel-contact').on('click', $.proxy(this.handleCancelClick, this));
  }

  handleAddClick() {
    $('#add-edit-form-title').text('Create Contact');
    $('#contacts-wrapper').css('visibility', 'hidden');
    $('#add-edit-contact').css('visibility', 'visible');
    $('#add-edit-contact').animate({'margin-top': '25px'}, 400, 'linear');
  }

  handleFilterClick() {
    $.get('api/contacts', (contacts) => {
      this.loadFilterForm(contacts);
      $('#filter-form').css('visibility', 'visible');
      $('#actions').css('visibility', 'hidden');
    });
  }

 loadFilterForm(contacts) {
    let tags = this.getUniqueTags(contacts);
    console.log(tags);
    $('body').append(this.filterFormTemplate({tags}));
  }

  getUniqueTags(contacts) {
    let uniqueTags = [];
    contacts.forEach(({tags}) => {
      if (tags) {
        tags = tags.split(',');
        tags.forEach(tag => {
          if (!uniqueTags.includes(tag)) {
            uniqueTags.push(tag);
          }
        });
      }
    });

    return uniqueTags;
  }

  handleCancelClick() {
    $('#add-edit-contact').animate({'margin-top': '-500px'}, 400, 'linear', () => {
      $('#contacts-wrapper').css('visibility', 'visible');
      $('#add-edit-contact').css('visibility', 'hidden');
    });
  }
}

$(() => new App);