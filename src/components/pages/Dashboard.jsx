import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/molecules/StatCard";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { format } from "date-fns";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";
import activityService from "@/services/api/activityService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [contactsData, dealsData, activitiesData] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
        activityService.getAll()
      ]);
      
      setContacts(contactsData);
      setDeals(dealsData);
      setActivities(activitiesData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading rows={6} />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const totalDealsValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const closedDeals = deals.filter(deal => deal.stage === "Closed");
  const pipelineValue = deals
    .filter(deal => deal.stage !== "Closed")
    .reduce((sum, deal) => sum + deal.value, 0);
  const recentActivities = activities
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  const upcomingActivities = activities
    .filter(activity => new Date(activity.date) > new Date() && !activity.completed)
    .slice(0, 3);

  const getActivityIcon = (type) => {
    switch (type) {
      case "call": return "Phone";
      case "email": return "Mail";
      case "meeting": return "Calendar";
      default: return "Activity";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your CRM activity</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="secondary"
            onClick={() => navigate("/contacts")}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Users" className="h-4 w-4" />
            <span>View Contacts</span>
          </Button>
          <Button 
            onClick={() => navigate("/deals")}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="TrendingUp" className="h-4 w-4" />
            <span>View Pipeline</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contacts"
          value={contacts.length.toString()}
          icon="Users"
          color="primary"
        />
        <StatCard
          title="Active Deals"
          value={deals.filter(d => d.stage !== "Closed").length.toString()}
          icon="TrendingUp"
          color="accent"
        />
        <StatCard
          title="Pipeline Value"
          value={`$${(pipelineValue / 1000).toFixed(0)}K`}
          icon="DollarSign"
          color="secondary"
        />
        <StatCard
          title="Closed Deals"
          value={closedDeals.length.toString()}
          icon="Target"
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/activities")}
              className="text-sm"
            >
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.Id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ApperIcon name={getActivityIcon(activity.type)} className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pipeline Overview</h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/deals")}
              className="text-sm"
            >
              View Pipeline
            </Button>
          </div>
          <div className="space-y-4">
            {["Lead", "Qualified", "Proposal", "Negotiation"].map(stage => {
              const stageDeals = deals.filter(deal => deal.stage === stage);
              const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
              return (
                <div key={stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{stage}</p>
                    <p className="text-sm text-gray-600">{stageDeals.length} deals</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${(stageValue / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Activities */}
      {upcomingActivities.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingActivities.map(activity => (
              <div key={activity.Id} className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3 mb-2">
                  <ApperIcon name={getActivityIcon(activity.type)} className="h-5 w-5 text-yellow-600" />
                  <p className="font-medium text-gray-900">{activity.title}</p>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <p className="text-xs font-medium text-yellow-700">
                  {format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;