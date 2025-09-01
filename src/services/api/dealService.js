import dealsData from "@/services/mockData/deals.json";

class DealService {
  constructor() {
    this.deals = [...dealsData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.deals];
  }

  async getById(id) {
    await this.delay(200);
    const deal = this.deals.find(deal => deal.Id === parseInt(id));
    return deal ? { ...deal } : null;
  }

  async create(dealData) {
    await this.delay(400);
    const newDeal = {
      ...dealData,
      Id: Math.max(...this.deals.map(d => d.Id)) + 1,
      createdAt: new Date().toISOString()
    };
    this.deals.push(newDeal);
    return { ...newDeal };
  }

  async update(id, dealData) {
    await this.delay(350);
    const index = this.deals.findIndex(deal => deal.Id === parseInt(id));
    if (index !== -1) {
      this.deals[index] = {
        ...this.deals[index],
        ...dealData,
        Id: parseInt(id)
      };
      return { ...this.deals[index] };
    }
    return null;
  }

  async delete(id) {
    await this.delay(250);
    const index = this.deals.findIndex(deal => deal.Id === parseInt(id));
    if (index !== -1) {
      const deletedDeal = this.deals.splice(index, 1)[0];
      return { ...deletedDeal };
    }
    return null;
  }

  async updateStage(id, stage) {
    return this.update(id, { stage });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new DealService();