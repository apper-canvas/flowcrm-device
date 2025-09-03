class ContactService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'contact_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
{"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
{"field": {"Name": "company_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "updated_at_c"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch contacts:", response.message);
        throw new Error(response.message);
      }

      // Transform data for UI compatibility
      return response.data.map(contact => ({
...contact,
        name: contact.Name || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
tags: contact.Tags ? contact.Tags.split(',').map(tag => tag.trim()) : [],
        createdAt: contact.created_at_c || contact.CreatedOn || new Date().toISOString(),
        updatedAt: contact.updated_at_c || contact.ModifiedOn || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error in ContactService.getAll:", error.message || error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
{"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
{"field": {"Name": "company_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "updated_at_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        return null;
      }

      // Transform data for UI compatibility
      const contact = response.data;
      return {
...contact,
        name: contact.Name || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
tags: contact.Tags ? contact.Tags.split(',').map(tag => tag.trim()) : [],
        createdAt: contact.created_at_c || contact.CreatedOn || new Date().toISOString(),
        updatedAt: contact.updated_at_c || contact.ModifiedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error in ContactService.getById(${id}):`, error.message || error);
      return null;
    }
  }

  async create(contactData) {
    try {
      // Only include Updateable fields
      const params = {
records: [{
          Name: contactData.name || '',
          email_c: contactData.email || '',
          phone_c: contactData.phone || '',
company_c: contactData.company || '',
          Tags: Array.isArray(contactData.tags) ? contactData.tags.join(',') : (contactData.tags || ''),
          created_at_c: new Date().toISOString(),
          updated_at_c: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create contact:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                throw new Error(`${error.fieldLabel}: ${error.message}`);
              });
            }
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }

        if (successful.length > 0) {
          const newContact = successful[0].data;
          return {
...newContact,
            name: newContact.Name || '',
            email: newContact.email_c || '',
            phone: newContact.phone_c || '',
            company: newContact.company_c || '',
tags: newContact.Tags ? newContact.Tags.split(',').map(tag => tag.trim()) : [],
            createdAt: newContact.created_at_c || newContact.CreatedOn || new Date().toISOString(),
            updatedAt: newContact.updated_at_c || newContact.ModifiedOn || new Date().toISOString()
          };
        }
      }
      
      throw new Error("No successful records returned");
    } catch (error) {
      console.error("Error in ContactService.create:", error.message || error);
      throw error;
    }
  }

  async update(id, contactData) {
    try {
      // Only include Updateable fields
      const params = {
records: [{
          Id: parseInt(id),
          Name: contactData.name || '',
          email_c: contactData.email || '',
          phone_c: contactData.phone || '',
company_c: contactData.company || '',
          Tags: Array.isArray(contactData.tags) ? contactData.tags.join(',') : (contactData.tags || ''),
          updated_at_c: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update contact:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                throw new Error(`${error.fieldLabel}: ${error.message}`);
              });
            }
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }

        if (successful.length > 0) {
          const updatedContact = successful[0].data;
          return {
...updatedContact,
            name: updatedContact.Name || '',
            email: updatedContact.email_c || '',
            phone: updatedContact.phone_c || '',
            company: updatedContact.company_c || '',
tags: updatedContact.Tags ? updatedContact.Tags.split(',').map(tag => tag.trim()) : [],
            createdAt: updatedContact.created_at_c || updatedContact.CreatedOn || new Date().toISOString(),
            updatedAt: updatedContact.updated_at_c || updatedContact.ModifiedOn || new Date().toISOString()
          };
        }
      }
      
      throw new Error("No successful records returned");
    } catch (error) {
      console.error(`Error in ContactService.update(${id}):`, error.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to delete contact:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error(`Error in ContactService.delete(${id}):`, error.message || error);
      throw error;
    }
  }
}

const contactService = new ContactService();
export default contactService;