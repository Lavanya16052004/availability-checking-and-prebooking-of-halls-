import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HallSelector({ halls, selectedHall, onSelectHall, building }) {
    if (halls.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <p className="font-medium">No halls available</p>
                <p className="text-sm">No common halls found in {building}</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {halls.map((hall, index) => (
                <motion.div
                    key={hall.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <button
                        onClick={() => onSelectHall(hall)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                            selectedHall?.id === hall.id 
                            ? building === "Main Block" 
                                ? 'bg-blue-100 text-blue-800 shadow-sm border border-blue-200' 
                                : 'bg-purple-100 text-purple-800 shadow-sm border border-purple-200'
                            : 'hover:bg-slate-100 border border-transparent'
                        }`}
                    >
                        <div>
                            <span className="font-semibold">{hall.room_number}</span>
                            <p className="text-xs text-slate-500 mt-1">{hall.room_type}</p>
                        </div>
                        {selectedHall?.id === hall.id && (
                            <CheckCircle className={`w-5 h-5 ${
                                building === "Main Block" ? "text-blue-600" : "text-purple-600"
                            }`} />
                        )}
                    </button>
                </motion.div>
            ))}
        </div>
    );
}