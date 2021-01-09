class Contact {
  constructor({full_name, email, phone_number, tags, id = null}) {
    this.id = id,
    this.full_name = full_name,
    this.email = email,
    this.phone_number = phone_number,
    this.tags = tags;
    this.tagsArray = this.separateTags(tags);
  }

  separateTags(tags) {
    if (tags) {
      tags = tags.split(',');
    }

    return tags;
  }

  add(callback) {
    $.post('/api/contacts', this, callback);
  }

  delete(callback) {
    let id = this.id;
    $.ajax({
      method: 'DELETE',
      url: `/api/contacts/${id}`,
    })
      .done(callback);
  }

  edit(callback) {
    let self = this;
    $.ajax({
      method: 'PUT',
      url: `/api/contacts/${self.id}`,
      data: self,
    })
      .done(callback);
  }
}
 
class App {
  constructor() {
    this.renderPage();
    this.bindEvents();
    this.filterFormTemplate = Handlebars.compile($('#filter-form-template').html());
  }

  renderPage() {
    let contactsTemplate = Handlebars.compile($('#contacts').html());
    $.get('/api/contacts', (contacts) => {
      contacts = contacts.map((contact) => {
        return new Contact(contact);
      });
      
      $('body').append(contactsTemplate({contacts}));
    });
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
    contacts.forEach(contact => {
      let tags = new Contact(contact).tags;
      if (tags) {
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