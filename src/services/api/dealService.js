class DealService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'deal_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch deals:", response.message);
        throw new Error(response.message);
      }

      // Transform data for UI compatibility
      return response.data.map(deal => ({
        ...deal,
        title: deal.title_c || deal.Name || '',
        value: deal.value_c || 0,
        stage: deal.stage_c || 'Lead',
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c || null,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c || null,
        createdAt: deal.created_at_c || deal.CreatedOn || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error in DealService.getAll:", error.message || error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "contact_id_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        return null;
      }

      // Transform data for UI compatibility
      const deal = response.data;
      return {
        ...deal,
        title: deal.title_c || deal.Name || '',
        value: deal.value_c || 0,
        stage: deal.stage_c || 'Lead',
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c || null,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c || null,
        createdAt: deal.created_at_c || deal.CreatedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error in DealService.getById(${id}):`, error.message || error);
      return null;
    }
  }

  async create(dealData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: dealData.title || '',
          title_c: dealData.title || '',
          value_c: parseFloat(dealData.value) || 0,
          stage_c: dealData.stage || 'Lead',
          probability_c: parseInt(dealData.probability) || 0,
          expected_close_date_c: dealData.expectedCloseDate || null,
          contact_id_c: parseInt(dealData.contactId) || null,
          created_at_c: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create deal:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, failed);
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
          const newDeal = successful[0].data;
          return {
            ...newDeal,
            title: newDeal.title_c || newDeal.Name || '',
            value: newDeal.value_c || 0,
            stage: newDeal.stage_c || 'Lead',
            probability: newDeal.probability_c || 0,
            expectedCloseDate: newDeal.expected_close_date_c || null,
            contactId: newDeal.contact_id_c?.Id || newDeal.contact_id_c || null,
            createdAt: newDeal.created_at_c || newDeal.CreatedOn || new Date().toISOString()
          };
        }
      }
      
      throw new Error("No successful records returned");
    } catch (error) {
      console.error("Error in DealService.create:", error.message || error);
      throw error;
    }
  }

  async update(id, dealData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: dealData.title || '',
          title_c: dealData.title || '',
          value_c: parseFloat(dealData.value) || 0,
          stage_c: dealData.stage || 'Lead',
          probability_c: parseInt(dealData.probability) || 0,
          expected_close_date_c: dealData.expectedCloseDate || null,
          contact_id_c: parseInt(dealData.contactId) || null
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update deal:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, failed);
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
          const updatedDeal = successful[0].data;
          return {
            ...updatedDeal,
            title: updatedDeal.title_c || updatedDeal.Name || '',
            value: updatedDeal.value_c || 0,
            stage: updatedDeal.stage_c || 'Lead',
            probability: updatedDeal.probability_c || 0,
            expectedCloseDate: updatedDeal.expected_close_date_c || null,
            contactId: updatedDeal.contact_id_c?.Id || updatedDeal.contact_id_c || null,
            createdAt: updatedDeal.created_at_c || updatedDeal.CreatedOn || new Date().toISOString()
          };
        }
      }
      
      throw new Error("No successful records returned");
    } catch (error) {
      console.error(`Error in DealService.update(${id}):`, error.message || error);
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
        console.error("Failed to delete deal:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals:`, failed);
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
      console.error(`Error in DealService.delete(${id}):`, error.message || error);
      throw error;
    }
  }

  async updateStage(id, stage) {
    return this.update(id, { stage });
  }
}

const dealService = new DealService();
export default dealService;
export default dealService;