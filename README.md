This is a contact manager app that was built as part of the Launch School curriculum. The back end was provided by Launch School, and I implemented the front end. 

I used the ES6 class syntax, and separated concerns into the Contact, ContactList, and App classes. 
  Contact is responsible for adding, updating, and deleting a single contact.

  ContactList is responsible for retrieving, rendering, and filtering contacts. It also provides an interface between the Contact and App class. For example, the ContactList has an edit method which creates a contact object from the form, then uses the contact object to send the PUT request to the API.

  App is responsible for all other functionality on the page, such as showing and hiding the filter-form, binding event handlers, and providing animations.