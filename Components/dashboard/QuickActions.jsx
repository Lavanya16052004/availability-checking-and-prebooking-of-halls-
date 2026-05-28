import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building2, Calendar, Map, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function QuickActions({ currentRoom }) {
  const actions = [
    {
      title: "Main Block",
      description: "Browse and occupy rooms in the main building",
      icon: Building2,
      url: createPageUrl("MainBlock"),
      color: "blue",
      disabled: false
    },
    {
      title: "Dharithri Block", 
      description: "Access labs and drawing halls",
      icon: Map,
      url: createPageUrl("DharithriBlock"),
      color: "purple",
      disabled: false
    },
    {
      title: "Book a Hall",
      description: "Reserve common halls for events and lectures",
      icon: Calendar,
      url: createPageUrl("HallBooking"),
      color: "green",
      disabled: false
    },
    {
      title: "Room Guide",
      description: "Learn how to use the room management system",
      icon: BookOpen,
      url: "#",
      color: "amber",
      disabled: true
    }
  ];

  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    amber: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {action.disabled ? (
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl opacity-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-600">{action.title}</h3>
                      <p className="text-xs text-slate-400">Coming soon</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{action.description}</p>
                </div>
              ) : (
                <Link to={action.url}>
                  <div className="group p-4 border border-slate-200 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${colorClasses[action.color]} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">{action.title}</h3>
                        <p className="text-xs text-slate-500">Click to access</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{action.description}</p>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
        
        {currentRoom && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-800">Room Status</p>
                <p className="text-sm text-blue-600">You can only occupy one room at a time</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}