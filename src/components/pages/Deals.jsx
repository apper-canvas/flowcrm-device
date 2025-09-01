import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { format } from "date-fns";
import dealService from "@/services/api/dealService";
import contactService from "@/services/api/contactService";

const stages = [
  { name: "Lead", color: "bg-gray-100 text-gray-800" },
  { name: "Qualified", color: "bg-blue-100 text-blue-800" },
  { name: "Proposal", color: "bg-yellow-100 text-yellow-800" },
  { name: "Negotiation", color: "bg-orange-100 text-orange-800" },
  { name: "Closed", color: "bg-green-100 text-green-800" }
];

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    stage: "Lead",
    contactId: "",
    probability: "",
    expectedCloseDate: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load deals. Please try again.");
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
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        contactId: parseInt(formData.contactId)
      };

      if (isEditing) {
        const updated = await dealService.update(selectedDeal.Id, dealData);
        setDeals(deals.map(d => d.Id === updated.Id ? updated : d));
        toast.success("Deal updated successfully!");
      } else {
        const newDeal = await dealService.create(dealData);
        setDeals([...deals, newDeal]);
        toast.success("Deal created successfully!");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Failed to save deal. Please try again.");
    }
  };

  const handleDelete = async (deal) => {
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      try {
        await dealService.delete(deal.Id);
        setDeals(deals.filter(d => d.Id !== deal.Id));
        toast.success("Deal deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete deal. Please try again.");
      }
    }
  };

  const handleStageChange = async (dealId, newStage) => {
    try {
      const updated = await dealService.updateStage(dealId, newStage);
      setDeals(deals.map(d => d.Id === updated.Id ? updated : d));
      toast.success(`Deal moved to ${newStage}!`);
    } catch (err) {
      toast.error("Failed to update deal stage. Please try again.");
    }
  };

  const openModal = (deal = null) => {
    if (deal) {
      setIsEditing(true);
      setSelectedDeal(deal);
      setFormData({
        title: deal.title,
        value: deal.value.toString(),
        stage: deal.stage,
        contactId: deal.contactId.toString(),
        probability: deal.probability.toString(),
        expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split("T")[0] : ""
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      value: "",
      stage: "Lead",
      contactId: "",
      probability: "",
      expectedCloseDate: ""
    });
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? contact.name : "Unknown Contact";
  };

  const getStageBadgeColor = (stage) => {
    const stageConfig = stages.find(s => s.name === stage);
    return stageConfig ? stageConfig.color : "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  if (loading) return <Loading rows={4} />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-1">{deals.length} total deals</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center space-x-2">
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Deal</span>
        </Button>
      </div>

      {deals.length === 0 ? (
        <Empty
          icon="TrendingUp"
          title="No deals found"
          description="Get started by adding your first deal to the pipeline."
          actionText="Add Deal"
          onAction={() => openModal()}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {stages.map(stage => {
            const stageDeals = deals.filter(deal => deal.stage === stage.name);
            const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

            return (
              <div key={stage.name} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                  <Badge className={stage.color}>
                    {stageDeals.length}
                  </Badge>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(stageValue)}
                  </p>
                </div>

                <div className="space-y-3">
                  {stageDeals.map(deal => (
                    <div
                      key={deal.Id}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {deal.title}
                        </h4>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openModal(deal)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <ApperIcon name="Edit2" className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(deal)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <ApperIcon name="Trash2" className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Value</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(deal.value)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Contact</span>
                          <span className="text-gray-900 truncate max-w-24" title={getContactName(deal.contactId)}>
                            {getContactName(deal.contactId)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Probability</span>
                          <span className="text-gray-900">{deal.probability}%</span>
                        </div>
                        {deal.expectedCloseDate && (
                          <div className="text-xs text-gray-500 pt-1 border-t">
                            Close: {format(new Date(deal.expectedCloseDate), "MMM d")}
                          </div>
                        )}
                      </div>

                      {/* Stage Actions */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        {stages.findIndex(s => s.name === stage.name) > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStageChange(deal.Id, stages[stages.findIndex(s => s.name === stage.name) - 1].name)}
                            className="text-xs p-1"
                          >
                            <ApperIcon name="ChevronLeft" className="h-3 w-3" />
                          </Button>
                        )}
                        <div className="flex-1"></div>
                        {stages.findIndex(s => s.name === stage.name) < stages.length - 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStageChange(deal.Id, stages[stages.findIndex(s => s.name === stage.name) + 1].name)}
                            className="text-xs p-1"
                          >
                            <ApperIcon name="ChevronRight" className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Deal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Deal" : "Add New Deal"}
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <FormField
            label="Deal Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Software License Deal"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Value ($)"
              name="value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
              placeholder="50000"
            />
            <FormField
              label="Probability (%)"
              name="probability"
              type="number"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              required
              placeholder="70"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Stage"
              name="stage"
              type="select"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              options={stages.map(stage => ({ value: stage.name, label: stage.name }))}
            />
            <FormField
              label="Contact"
              name="contactId"
              type="select"
              value={formData.contactId}
              onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
required
              options={contacts.map(contact => ({ value: contact.Id, label: contact.name_c || contact.Name }))}
            />
          </div>

          <FormField
            label="Expected Close Date"
            name="expectedCloseDate"
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
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
              {isEditing ? "Update Deal" : "Add Deal"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Deals;