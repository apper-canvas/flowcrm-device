import contactsData from "@/services/mockData/contacts.json";

class ContactService {
  constructor() {
    this.contacts = [...contactsData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.contacts];
  }

  async getById(id) {
    await this.delay(200);
    const contact = this.contacts.find(contact => contact.Id === parseInt(id));
    return contact ? { ...contact } : null;
  }

  async create(contactData) {
    await this.delay(400);
    const newContact = {
      ...contactData,
      Id: Math.max(...this.contacts.map(c => c.Id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.contacts.push(newContact);
    return { ...newContact };
  }

  async update(id, contactData) {
    await this.delay(350);
    const index = this.contacts.findIndex(contact => contact.Id === parseInt(id));
    if (index !== -1) {
      this.contacts[index] = {
        ...this.contacts[index],
        ...contactData,
        Id: parseInt(id),
        updatedAt: new Date().toISOString()
      };
      return { ...this.contacts[index] };
    }
    return null;
  }

  async delete(id) {
    await this.delay(250);
    const index = this.contacts.findIndex(contact => contact.Id === parseInt(id));
    if (index !== -1) {
      const deletedContact = this.contacts.splice(index, 1)[0];
      return { ...deletedContact };
    }
    return null;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ContactService();