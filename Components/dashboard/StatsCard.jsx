import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, color, description }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-700",
    red: "from-red-500 to-red-600 text-red-700", 
    green: "from-green-500 to-green-600 text-green-700",
    amber: "from-amber-500 to-amber-600 text-amber-700"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${colorClasses[color]} opacity-10 rounded-full transform translate-x-8 -translate-y-8`}></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
              <div className="text-3xl font-bold text-slate-800 mb-1">
                {value}
              </div>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} bg-opacity-20`}>
              <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[2]}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}