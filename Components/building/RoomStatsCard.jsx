import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function RoomStatsCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-700",
    red: "from-red-500 to-red-600 text-red-700", 
    green: "from-green-500 to-green-600 text-green-700",
    purple: "from-purple-500 to-purple-600 text-purple-700",
    amber: "from-amber-500 to-amber-600 text-amber-700"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-r ${colorClasses[color]} opacity-10 rounded-full transform translate-x-6 -translate-y-6`}></div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
              <div className="text-2xl font-bold text-slate-800">
                {value}
              </div>
            </div>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} bg-opacity-20`}>
              <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[2]}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}