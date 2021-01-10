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

  add() {
    $.post('/api/contacts', this);
  }

  delete() {
    let id = this.id;
    $.ajax({
      method: 'DELETE',
      url: `/api/contacts/${id}`,
    });
  }

  edit() {
    let id = this.id;
    let self = this;
    $.ajax({
      method: 'PUT',
      url: `/api/contacts/${id}`,
      data: self,
    });
  }
}

class ContactList {
  constructor(app) {
    this.contactsTemplate = Handlebars.compile($('#contacts').html());
    this.app = app;
  }

  renderContacts() {
    $.get('/api/contacts', (contacts) => {
      contacts = contacts.map((contact) => {
        return new Contact(contact);
      });

      $('body').append(this.contactsTemplate({contacts}));
      this.app.bindContactEvents();
    });
  }

  get(id, callback) {
    $.get(`/api/contacts/${id}`, contact => {
      contact = new Contact(contact);
      callback(contact);
    });
  }

  getAll(callback) {
    $.get('/api/contacts', contacts => {
      callback(contacts);
    });
  }

  delete(id) {
    this.get(id, contact => {
      contact.delete();
      this.reloadContacts();
    });
  }

  reloadContacts() {
    $('#contacts-wrapper').remove();
    this.renderContacts();
  }

  getUniqueTags(callback) {
    this.getAll((contacts) => {
      let uniqueTags = this.filterContactsForUniqueTags(contacts);
      callback(uniqueTags);
    });
  }

  filterContactsForUniqueTags(contacts) {
    let uniqueTags = [];
      contacts.forEach(contact => {
        let tags = new Contact(contact).tagsArray;
        if (tags) {
          tags.forEach(tag => {
            tag = tag.toLowerCase();
            if (!uniqueTags.includes(tag)) {
              uniqueTags.push(tag);
            }
          });
        }
      });

    return uniqueTags;
  }

  filterContactsByTags(tags) {
    $('.contact').each((_, contact) => {
      let contactTags = this.getTagsFromContactElement(contact);
      if (this.hasCommonElement(tags, contactTags)) {
        $(contact).show();
      } else {
        $(contact).hide();
      }
    });
  }

  getTagsFromContactElement(contact) {
    let $contactTagElements = $(contact).find('dd.tag');
    let contactTags = [];
    $contactTagElements.each((_, tagElement) => {
      contactTags.push($(tagElement).text().toLowerCase());
    });

    return contactTags;
  }

  hasCommonElement(array1, array2) {
    let result = false;
    array1.forEach(elem => {
      if (array2.includes(elem)) {
        result = true;
      }
    });

    return result;
  }

  filterContactsByName(string) {
    $('.contact').each((_, contact) => {
      let contactName = $(contact).find('h2').text().toLowerCase();
      if (contactName.includes(string)) {
        $(contact).show();
      } else {
        $(contact).hide();
      }
    });
  }

  add($form) {
    let contact = this.makeContactFromForm($form);
    contact.add();
  }

  edit($form) {
    let contact = this.makeContactFromForm($form);
    contact.edit()
  }

  makeContactFromForm($form) {
    let $contactInputs = $form.find('input:not([name^="tag"])');
    let $tagInputs = $form.find('input[name^="tag"]');
    let contact = {};
    if ($('#submit-edit-contact').is(':visible')) {
      contact.id = $('#submit-edit-contact').attr('data-id');
    }

    $contactInputs.each((_, input) => {
      contact[input.name] = input.value;
    });

    contact.tags = this.getCSVTags($tagInputs);
    return new Contact(contact);
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
}
 
class App {
  constructor() {
    this.contactList = new ContactList(this);

    // Some events must be bound each time a template is loaded
    this.bindPermanentEvents();
    this.contactList.renderContacts();
    this.filterFormTemplate = Handlebars.compile($('#filter-form-template').html());
  }

  bindPermanentEvents() {
    $('#add').on('click', $.proxy(this.handleAddClick, this));
    $('#filter').on('click', $.proxy(this.handleFilterClick, this));
    $('#cancel-contact').on('click', $.proxy(this.handleCancelClick, this));
    $('#new-tag').on('click', $.proxy(this.handleNewTagClick, this));
    $('#tag-inputs').on('click', '.remove-tag', $.proxy(this.removeTagInput, this));
    $('#submit-new-contact').on('click', $.proxy(this.handleSubmitNewContact, this));
    $('#submit-edit-contact').on('click', $.proxy(this.handleSubmitEdit, this));
    $('#search').on('keyup', $.proxy(this.handleSearch, this));
  }

  bindContactEvents() {
    $('#contacts-wrapper').on('click', '.delete', $.proxy(this.handleDeleteClick, this));
    $('#contacts-wrapper').on('click', '.edit', $.proxy(this.handleEditClick, this));
  }

  handleAddClick() {
    $('#add-edit-form-title').text('Create Contact');
    $('#submit-edit-contact').hide();
    $('#submit-new-contact').show();
    this.slideDownContactForm();
  }

  slideDownContactForm() {
    $('#contacts-wrapper').css('visibility', 'hidden');
    $('#add-edit-contact').css('visibility', 'visible');
    $('#add-edit-contact').animate({'margin-top': '25px'}, 400, 'linear');
  }

  handleDeleteClick(event) {
    let id = $(event.target).attr('data-id');
    this.contactList.delete(id);
  }

  handleEditClick(event) {
    let id = $(event.target).attr('data-id');
    $('#add-edit-form-title').text('Edit Contact');
    $('#submit-new-contact').hide();
    $('#submit-edit-contact').show();
    this.slideDownContactForm();
    this.contactList.get(id, contact => {
      this.populateEditForm(contact);
    });
  }

  populateEditForm(contact) {
    $('#full_name').val(contact['full_name']);
    $('#email').val(contact['email']);
    $('#phone_number').val(contact['phone_number']);
    $('#submit-edit-contact').attr('data-id', contact['id']);
    if (contact.tags) {
      this.populateTags(contact.tagsArray);
    }
  }

  populateTags(tags) {
    tags.forEach(tag => {
      this.addNewTagInput(tag);
    }, this);
  }

  handleFilterClick() {
    this.contactList.getUniqueTags(tags => {
      $(this.filterFormTemplate({tags})).insertAfter('#actions');
      $('#actions').addClass('hide');
      $('#submit-filter-form').on('click', $.proxy(this.handleFilterSubmit, this));
      $('#show-all').on('click', $.proxy(this.handleShowAllClick, this));
    });
  }

  handleFilterSubmit(event) {
    event.preventDefault();
    let tags = this.getCheckedTags();
    this.contactList.filterContactsByTags(tags);
    $('#filter-form').remove();
    $('#actions').removeClass('hide');
  }

  getCheckedTags() {
    let $tagElements = $('#filter-form').find('input:checked + label');
    let tags = [];
    $tagElements.each((_, tag) => {
      tags.push($(tag).text());
    });

    return tags;
  }

  handleShowAllClick(event) {
    event.preventDefault();
    this.contactList.reloadContacts();
    $('#filter-form').remove();
    $('#actions').removeClass('hide');
  }
  
  handleSubmitEdit(event) {
    event.preventDefault();
    let $form = $('#add-edit-contact');
    this.contactList.edit($form);
    this.slideUpContactForm(() => {
      this.contactList.reloadContacts();
    });
  }

  handleCancelClick(event) {
    event.preventDefault();
    this.slideUpContactForm();
  }

  slideUpContactForm(callback = null) {
    $('#add-edit-contact').animate({'margin-top': '-500px'}, 400, 'linear', () => {
      $('#contacts-wrapper').css('visibility', 'visible');
      $('#add-edit-contact').css('visibility', 'hidden');
      this.resetContactForm();

      if (callback) {
        callback();
      }
    });
  }

  handleNewTagClick(event) {
    event.preventDefault();
    this.addNewTagInput();
  }

  addNewTagInput(tag = null) {
    let tagNumber = $('#tag-inputs input').length;
    let $input = $(`<input type="text" name="tag${tagNumber}" maxlength="12">`);
    let $removeTagButton = $('<button class="remove-tag">Remove Tag</button>');
    let $newTagButton = $('#new-tag');
    $input.insertBefore($newTagButton);
    $removeTagButton.insertBefore($newTagButton);
    if (tag) {
      $input.val(tag);
    }
  }

  removeTagInput(event) {
    event.preventDefault();
    $(event.target).prev().remove();
    $(event.target).remove();
  }

  handleSubmitNewContact(event) {
    event.preventDefault();
    let $form = $('#add-edit-contact');
    this.contactList.add($form);
    this.slideUpContactForm(() => {
      this.contactList.reloadContacts();
    });
  }

  resetContactForm() {
    let $form = $('#add-edit-contact');
    $form.find('#tag-inputs *:not(#new-tag)').remove();
    $form[0].reset();
  }

  handleSearch(event) {
    let searchString = $(event.target).val().toLowerCase();
    this.contactList.filterContactsByName(searchString);
  }
}

$(() => new App);