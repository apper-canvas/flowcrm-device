import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { format } from "date-fns";
import contactService from "@/services/api/contactService";
import activityService from "@/services/api/activityService";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    tags: ""
  });

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadContactActivities = async (contactId) => {
    try {
      const data = await activityService.getByContactId(contactId);
      setActivities(data);
    } catch (err) {
      console.error("Failed to load activities:", err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadContactActivities(selectedContact.Id);
    }
  }, [selectedContact]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const contactData = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
      };

      if (isEditing) {
        const updated = await contactService.update(selectedContact.Id, contactData);
        setContacts(contacts.map(c => c.Id === updated.Id ? updated : c));
        setSelectedContact(updated);
        toast.success("Contact updated successfully!");
      } else {
        const newContact = await contactService.create(contactData);
        setContacts([...contacts, newContact]);
        toast.success("Contact created successfully!");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Failed to save contact. Please try again.");
    }
  };

  const handleDelete = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      try {
        await contactService.delete(contact.Id);
        setContacts(contacts.filter(c => c.Id !== contact.Id));
        if (selectedContact?.Id === contact.Id) {
          setSelectedContact(null);
        }
        toast.success("Contact deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete contact. Please try again.");
      }
    }
  };

  const openModal = (contact = null) => {
    if (contact) {
      setIsEditing(true);
      setSelectedContact(contact);
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        tags: contact.tags.join(", ")
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      tags: ""
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "call": return "Phone";
      case "email": return "Mail";
      case "meeting": return "Calendar";
      default: return "Activity";
    }
  };

  if (loading) return <Loading rows={5} />;
  if (error) return <Error message={error} onRetry={loadContacts} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">{contacts.length} total contacts</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center space-x-2">
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Contact</span>
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search contacts..."
        />
      </div>

      {filteredContacts.length === 0 ? (
        <Empty
          icon="Users"
          title="No contacts found"
          description={searchTerm ? "No contacts match your search criteria." : "Get started by adding your first contact."}
          actionText="Add Contact"
          onAction={() => openModal()}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact List */}
          <div className="space-y-4">
            {filteredContacts.map(contact => (
              <div
                key={contact.Id}
                className={`card p-6 cursor-pointer transition-all duration-200 ${
                  selectedContact?.Id === contact.Id
                    ? "ring-2 ring-primary-500 bg-gradient-to-br from-primary-50 to-primary-100"
                    : "hover:shadow-lg"
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                    <p className="text-sm text-gray-600">{contact.company}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Mail" className="h-4 w-4 mr-2" />
                        {contact.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Phone" className="h-4 w-4 mr-2" />
                        {contact.phone}
                      </div>
                    </div>
                    {contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {contact.tags.map((tag, index) => (
                          <Badge key={index} variant="primary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(contact);
                      }}
                    >
                      <ApperIcon name="Edit2" className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(contact);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Detail Panel */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            {selectedContact ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Contact Details</h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openModal(selectedContact)}
                    className="flex items-center space-x-2"
                  >
                    <ApperIcon name="Edit2" className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedContact.name}</h3>
                    <p className="text-gray-600">{selectedContact.company}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center text-gray-600">
                      <ApperIcon name="Mail" className="h-5 w-5 mr-3 text-gray-400" />
                      <span>{selectedContact.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <ApperIcon name="Phone" className="h-5 w-5 mr-3 text-gray-400" />
                      <span>{selectedContact.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <ApperIcon name="Building" className="h-5 w-5 mr-3 text-gray-400" />
                      <span>{selectedContact.company}</span>
                    </div>
                  </div>

                  {selectedContact.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedContact.tags.map((tag, index) => (
                          <Badge key={index} variant="primary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500">
                      Created: {format(new Date(selectedContact.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {/* Activities Timeline */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                  {activities.length === 0 ? (
                    <p className="text-gray-500 text-sm">No activities recorded for this contact.</p>
                  ) : (
                    <div className="space-y-3">
                      {activities.slice(0, 5).map(activity => (
                        <div key={activity.Id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ApperIcon name={getActivityIcon(activity.type)} className="h-4 w-4 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-6">
                <div className="text-center text-gray-500">
                  <ApperIcon name="Users" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a contact to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Contact" : "Add New Contact"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <FormField
            label="Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <FormField
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <FormField
            label="Company"
            name="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
          />
          <FormField
            label="Tags (comma-separated)"
            name="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="VIP, Tech, Lead"
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Contact" : "Add Contact"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Contacts;