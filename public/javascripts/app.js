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
    this.renderContacts();

    // Some events must be bound each time a template is loaded
    this.bindPermanentEvents();
    this.filterFormTemplate = Handlebars.compile($('#filter-form-template').html());
    this.contactsTemplate = Handlebars.compile($('#contacts').html());
  }

  renderContacts() {
    $.get('/api/contacts', (contacts) => {
      contacts = contacts.map((contact) => {
        return new Contact(contact);
      });
      
      $('body').append(this.contactsTemplate({contacts}));
      this.bindContactEvents();
    });
  }

  bindPermanentEvents() {
    $('#add').on('click', $.proxy(this.handleAddClick, this));
    $('#filter').on('click', $.proxy(this.handleFilterClick, this));
    $('#cancel-contact').on('click', $.proxy(this.slideUpContactForm, this));
    $('#new-tag').on('click', $.proxy(this.addNewTagInput, this));
    $('#tag-inputs').on('click', '.remove-tag', $.proxy(this.removeTagInput, this));
    $('#submit-new-contact').on('click', $.proxy(this.handleNewContact, this));
  }

  bindContactEvents() {
    $('#contacts-wrapper').on('click', '.delete', $.proxy(this.handleDeleteClick, this));
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

  handleDeleteClick(event) {
    let id = $(event.target).attr('data-id');

    $.get(`/api/contacts/${id}`, contact => {
      new Contact(contact).delete();
      this.reloadContacts();
    });
  }

  reloadContacts() {
    $('#contacts-wrapper').remove();
    this.renderContacts();
  }

 loadFilterForm(contacts) {
    let tags = this.getUniqueTags(contacts);
    console.log(tags);
    $('body').append(this.filterFormTemplate({tags}));
  }

  getUniqueTags(contacts) {
    let uniqueTags = [];
    contacts.forEach(contact => {
      let tags = new Contact(contact).tagsArray;
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

  slideUpContactForm() {
    $('#add-edit-contact').animate({'margin-top': '-500px'}, 400, 'linear', () => {
      $('#contacts-wrapper').css('visibility', 'visible');
      $('#add-edit-contact').css('visibility', 'hidden');
    });
  }

  addNewTagInput(event) {
    event.preventDefault();
    let tagNumber = $('#tag-inputs input').length;
    let input = $(`<input type="text" name="tag${tagNumber}">`);
    let removeTagButton = $('<button class="remove-tag">Remove Tag</button>');
    input.insertBefore($(event.target));
    removeTagButton.insertBefore($(event.target));
  }

  removeTagInput(event) {
    event.preventDefault();
    $(event.target).prev().remove();
    $(event.target).remove();
  }

  handleNewContact(event) {
    event.preventDefault();
    let $form = $('#add-edit-contact');
    let contact = this.makeContactFromForm($form);
    this.resetContactForm($form);
    new Contact(contact).add();
    this.slideUpContactForm();
    this.reloadContacts();
  }

  makeContactFromForm($form) {
    let $contactInputs = $form.find('input:not([name^="tag"])');
    let $tagInputs = $form.find('input[name^="tag"]');
    let contact = {};

    $contactInputs.each((_, input) => {
      contact[input.name] = input.value;
    });

    contact.tags = this.getCSVTags($tagInputs);
    return contact;
  }

  getCSVTags($tagInputs) {
    let tags = [];
    $tagInputs.each((_, input) => {
      if (input.value && !tags.includes(input.value)) {
        tags.push(input.value);
      }
    });

    return tags.join(',');
  }

  resetContactForm($form) {
    $form.find('#tag-inputs *:not(#new-tag)').remove();
    $form[0].reset();
  }
}

$(() => new App);