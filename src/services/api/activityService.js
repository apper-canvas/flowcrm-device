class ActivityService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'activity_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch activities:", response.message);
        throw new Error(response.message);
      }

      // Transform data for UI compatibility
      return response.data.map(activity => ({
        ...activity,
        type: activity.type_c || 'call',
        title: activity.title_c || activity.Name || '',
        description: activity.description_c || '',
        contactId: activity.contact_id_c?.Id || activity.contact_id_c || null,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c || null,
        date: activity.date_c || new Date().toISOString(),
        completed: activity.completed_c || false
      }));
    } catch (error) {
      console.error("Error in ActivityService.getAll:", error.message || error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "completed_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        return null;
      }

      // Transform data for UI compatibility
      const activity = response.data;
      return {
        ...activity,
        type: activity.type_c || 'call',
        title: activity.title_c || activity.Name || '',
        description: activity.description_c || '',
        contactId: activity.contact_id_c?.Id || activity.contact_id_c || null,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c || null,
        date: activity.date_c || new Date().toISOString(),
        completed: activity.completed_c || false
      };
    } catch (error) {
      console.error(`Error in ActivityService.getById(${id}):`, error.message || error);
      return null;
    }
  }

  async getByContactId(contactId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "completed_c"}}
        ],
        where: [
          {
            "FieldName": "contact_id_c",
            "Operator": "EqualTo",
            "Values": [parseInt(contactId)],
            "Include": true
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch activities by contact:", response.message);
        throw new Error(response.message);
      }

      // Transform data for UI compatibility
      return response.data.map(activity => ({
        ...activity,
        type: activity.type_c || 'call',
        title: activity.title_c || activity.Name || '',
        description: activity.description_c || '',
        contactId: activity.contact_id_c?.Id || activity.contact_id_c || null,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c || null,
        date: activity.date_c || new Date().toISOString(),
        completed: activity.completed_c || false
      }));
    } catch (error) {
      console.error(`Error in ActivityService.getByContactId(${contactId}):`, error.message || error);
      return [];
    }
  }

  async create(activityData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: activityData.title || '',
          type_c: activityData.type || 'call',
          title_c: activityData.title || '',
          description_c: activityData.description || '',
          contact_id_c: parseInt(activityData.contactId) || null,
          deal_id_c: activityData.dealId ? parseInt(activityData.dealId) : null,
          date_c: activityData.date || new Date().toISOString(),
          completed_c: Boolean(activityData.completed)
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create activity:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} activities:`, failed);
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
          const newActivity = successful[0].data;
          return {
            ...newActivity,
            type: newActivity.type_c || 'call',
            title: newActivity.title_c || newActivity.Name || '',
            description: newActivity.description_c || '',
            contactId: newActivity.contact_id_c?.Id || newActivity.contact_id_c || null,
            dealId: newActivity.deal_id_c?.Id || newActivity.deal_id_c || null,
            date: newActivity.date_c || new Date().toISOString(),
            completed: newActivity.completed_c || false
          };
        }
      }
      
      throw new Error("No successful records returned");
    } catch (error) {
      console.error("Error in ActivityService.create:", error.message || error);
      throw error;
    }
  }

  async update(id, activityData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: activityData.title || '',
          type_c: activityData.type || 'call',
          title_c: activityData.title || '',
          description_c: activityData.description || '',
          contact_id_c: parseInt(activityData.contactId) || null,
          deal_id_c: activityData.dealId ? parseInt(activityData.dealId) : null,
          date_c: activityData.date || new Date().toISOString(),
          completed_c: Boolean(activityData.completed)
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update activity:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} activities:`, failed);
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
          const updatedActivity = successful[0].data;
          return {
            ...updatedActivity,
            type: updatedActivity.type_c || 'call',
            title: updatedActivity.title_c || updatedActivity.Name || '',
            description: updatedActivity.description_c || '',
            contactId: updatedActivity.contact_id_c?.Id || updatedActivity.contact_id_c || null,
            dealId: updatedActivity.deal_id_c?.Id || updatedActivity.deal_id_c || null,
            date: updatedActivity.date_c || new Date().toISOString(),
            completed: updatedActivity.completed_c || false
          };
        }
      }
      
      throw new Error("No successful records returned");
    } catch (error) {
      console.error(`Error in ActivityService.update(${id}):`, error.message || error);
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
        console.error("Failed to delete activity:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} activities:`, failed);
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
      console.error(`Error in ActivityService.delete(${id}):`, error.message || error);
      throw error;
    }
  }
}

const activityService = new ActivityService();
export default activityService;

export default new ActivityService();