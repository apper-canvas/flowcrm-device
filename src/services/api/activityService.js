import activitiesData from "@/services/mockData/activities.json";

class ActivityService {
  constructor() {
    this.activities = [...activitiesData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.activities];
  }

  async getById(id) {
    await this.delay(200);
    const activity = this.activities.find(activity => activity.Id === parseInt(id));
    return activity ? { ...activity } : null;
  }

  async getByContactId(contactId) {
    await this.delay(250);
    return this.activities
      .filter(activity => activity.contactId === parseInt(contactId))
      .map(activity => ({ ...activity }));
  }

  async create(activityData) {
    await this.delay(400);
    const newActivity = {
      ...activityData,
      Id: Math.max(...this.activities.map(a => a.Id)) + 1,
      date: activityData.date || new Date().toISOString()
    };
    this.activities.push(newActivity);
    return { ...newActivity };
  }

  async update(id, activityData) {
    await this.delay(350);
    const index = this.activities.findIndex(activity => activity.Id === parseInt(id));
    if (index !== -1) {
      this.activities[index] = {
        ...this.activities[index],
        ...activityData,
        Id: parseInt(id)
      };
      return { ...this.activities[index] };
    }
    return null;
  }

  async delete(id) {
    await this.delay(250);
    const index = this.activities.findIndex(activity => activity.Id === parseInt(id));
    if (index !== -1) {
      const deletedActivity = this.activities.splice(index, 1)[0];
      return { ...deletedActivity };
    }
    return null;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ActivityService();