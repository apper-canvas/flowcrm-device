import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { format } from "date-fns";
import activityService from "@/services/api/activityService";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";

const activityTypes = [
  { value: "call", label: "Call", icon: "Phone", color: "bg-blue-100 text-blue-800" },
  { value: "email", label: "Email", icon: "Mail", color: "bg-green-100 text-green-800" },
  { value: "meeting", label: "Meeting", icon: "Calendar", color: "bg-purple-100 text-purple-800" },
  { value: "note", label: "Note", icon: "FileText", color: "bg-gray-100 text-gray-800" }
];

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [formData, setFormData] = useState({
    type: "call",
    title: "",
    description: "",
    contactId: "",
    dealId: "",
    date: "",
    completed: false
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const activityData = {
        ...formData,
        contactId: parseInt(formData.contactId),
        dealId: formData.dealId ? parseInt(formData.dealId) : null,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
      };

      if (isEditing) {
        const updated = await activityService.update(selectedActivity.Id, activityData);
        setActivities(activities.map(a => a.Id === updated.Id ? updated : a));
        toast.success("Activity updated successfully!");
      } else {
        const newActivity = await activityService.create(activityData);
        setActivities([...activities, newActivity]);
        toast.success("Activity created successfully!");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to save activity. Please try again.");
    }
  };

  const handleDelete = async (activity) => {
    if (window.confirm(`Are you sure you want to delete "${activity.title}"?`)) {
      try {
        await activityService.delete(activity.Id);
        setActivities(activities.filter(a => a.Id !== activity.Id));
        toast.success("Activity deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete activity. Please try again.");
      }
    }
  };

  const handleToggleComplete = async (activity) => {
    try {
      const updated = await activityService.update(activity.Id, {
        ...activity,
        completed: !activity.completed
      });
      setActivities(activities.map(a => a.Id === updated.Id ? updated : a));
      toast.success(`Activity marked as ${updated.completed ? "completed" : "pending"}!`);
    } catch (err) {
      toast.error("Failed to update activity status. Please try again.");
    }
  };

const openModal = (activity = null) => {
    if (activity) {
      setIsEditing(true);
      setSelectedActivity(activity);
      setFormData({
        type: activity.type,
        title: activity.title,
        description: activity.description,
        contactId: activity.contactId ? activity.contactId.toString() : "",
        dealId: activity.dealId ? activity.dealId.toString() : "",
        date: activity.date ? activity.date.split("T")[0] : "",
        completed: activity.completed
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: "call",
      title: "",
      description: "",
      contactId: "",
      dealId: "",
      date: "",
      completed: false
    });
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? contact.name : "Unknown Contact";
  };

  const getDealTitle = (dealId) => {
    const deal = deals.find(d => d.Id === dealId);
    return deal ? deal.title : null;
  };

  const getActivityTypeConfig = (type) => {
    return activityTypes.find(t => t.value === type) || activityTypes[0];
  };

  const filteredActivities = activities
    .filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getContactName(activity.contactId).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !filterType || activity.type === filterType;
      const matchesStatus = !filterStatus || 
                           (filterStatus === "completed" && activity.completed) ||
                           (filterStatus === "pending" && !activity.completed);

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) return <Loading rows={5} />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-1">{activities.length} total activities</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center space-x-2">
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Activity</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activities..."
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <Empty
          icon="Calendar"
          title="No activities found"
          description={searchTerm || filterType || filterStatus ? "No activities match your current filters." : "Get started by adding your first activity."}
          actionText="Add Activity"
          onAction={() => openModal()}
        />
      ) : (
        <div className="space-y-4">
          {filteredActivities.map(activity => {
            const typeConfig = getActivityTypeConfig(activity.type);
            const isUpcoming = new Date(activity.date) > new Date() && !activity.completed;
            
            return (
              <div
                key={activity.Id}
                className={`card p-6 ${
                  isUpcoming ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.completed ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      <ApperIcon
                        name={typeConfig.icon}
                        className={`h-5 w-5 ${
                          activity.completed ? "text-green-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {activity.title}
                        </h3>
                        <Badge className={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                        <Badge variant={activity.completed ? "success" : "warning"}>
                          {activity.completed ? "Completed" : "Pending"}
                        </Badge>
                        {isUpcoming && (
                          <Badge variant="warning">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{activity.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="User" className="h-4 w-4" />
                          <span>{getContactName(activity.contactId)}</span>
                        </div>
                        {activity.dealId && (
                          <div className="flex items-center space-x-2">
                            <ApperIcon name="TrendingUp" className="h-4 w-4" />
                            <span>{getDealTitle(activity.dealId)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="Clock" className="h-4 w-4" />
                          <span>{format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleComplete(activity)}
                      className={activity.completed ? "text-green-600 hover:text-green-700" : "text-gray-600 hover:text-gray-700"}
                    >
                      <ApperIcon name={activity.completed ? "CheckCircle2" : "Circle"} className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(activity)}
                    >
                      <ApperIcon name="Edit2" className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(activity)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Activity" : "Add New Activity"}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Activity Type"
              name="type"
              type="select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={activityTypes.map(type => ({ value: type.value, label: type.label }))}
            />
            <FormField
              label="Contact"
              name="contactId"
              type="select"
              value={formData.contactId}
              onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
              required
              options={contacts.map(contact => ({ value: contact.Id, label: contact.name }))}
            />
          </div>

          <FormField
            label="Activity Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Follow-up call"
          />

          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed notes about the activity..."
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Related Deal (Optional)"
              name="dealId"
              type="select"
              value={formData.dealId}
              onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
              options={deals.map(deal => ({ value: deal.Id, label: deal.title }))}
              placeholder="Select a deal"
            />
            <FormField
              label="Date & Time"
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completed}
              onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="completed" className="text-sm font-medium text-gray-700">
              Mark as completed
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Activity" : "Add Activity"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Activities;